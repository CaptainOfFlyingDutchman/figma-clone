# Figma-Style MVP for Morphic Interview

This repository starts as an architecture and execution plan for a Figma-style MVP built with Next.js.

## Goal

Build an interview-ready collaborative design app with:

- Infinite canvas
- Select, move, resize, rotate
- Frames, rectangles, ellipses, text, images
- Multiplayer presence and live cursors
- Real-time collaboration on shapes
- Threaded comments pinned to canvas objects or coordinates
- `@mentions` in comments
- Document persistence and basic version snapshots

## Recommended Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS or plain CSS modules
- Zustand for local UI state
- PixiJS for canvas rendering
- Custom scene graph and transform system

### Collaboration

- Yjs for CRDT document sync
- `y-websocket` first, with a provider-agnostic adapter
- future migration path to Hocuspocus
- Awareness API for cursors, selections, and presence

### Backend

- Next.js for HTTP routes and app shell
- Separate Node WebSocket server for realtime sync
- PostgreSQL for projects, comments, users, memberships, snapshots
- Redis for pub/sub and horizontal scale later
- S3-compatible object storage for images

### Comments / Mentions

- Tiptap for rich text comment composer
- Tiptap mention extension for `@mentions`
- Store threads/comments in Postgres
- Broadcast comment events over WebSocket

## Core Recommendation

Do not build the canvas on top of Fabric.js if your goal is a believable Figma-like MVP.

Fabric is good for:

- quick demos
- object manipulation on a 2D canvas
- simple editors

Fabric becomes awkward for:

- large infinite canvases
- complex selection and transform logic
- clean separation between app state and render state
- higher-performance rendering at scale
- future WebGL-first evolution

Use PixiJS for rendering and keep your document model independent from the renderer.

## Migration-Friendly Collaboration Plan

We will design the app so `y-websocket` is the first transport, but the editor never depends directly on it.

Stable layers:

- editor engine
- Yjs document schema
- awareness payload shape
- app auth/session model
- persistence interfaces

Replaceable layers:

- websocket provider client
- collaboration server
- connection/auth handshake details
- persistence hooks inside the collaboration server

This lets us start simple and move to Hocuspocus later without reworking the editor model.

## Architecture

### 1. Data model

Keep one canonical document per file in Yjs.

Suggested split:

- `Y.Map("meta")`
- `Y.Map("pages")`
- `Y.Map("nodes")`
- `Y.Map("presence")` for awareness-like metadata if needed

Each node should be normalized:

```ts
type NodeId = string;

type CanvasNode = {
  id: NodeId;
  type: "frame" | "rect" | "ellipse" | "text" | "image";
  parentId: NodeId | null;
  childIds: NodeId[];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  name: string;
  fill?: { color: string };
  stroke?: { color: string; width: number };
  text?: {
    content: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: number;
    align: "left" | "center" | "right";
  };
  image?: {
    assetId: string;
    objectFit: "fill" | "contain" | "cover";
  };
};
```

Important rule:

The renderer reads from the document model. It does not own the truth.

### 2. Canvas engine

Build a small editor engine instead of coupling app behavior to a library object model.

Recommended layers:

- `camera`: zoom, pan, viewport transforms
- `document`: pages, nodes, z-order
- `selection`: selected ids, hover, marquee
- `tools`: move, frame, rect, text, comment-pin
- `renderer`: Pixi display objects derived from nodes
- `hit-testing`: spatial index for picking
- `commands`: move, resize, group, ungroup, delete, duplicate

Keep input handling separate from rendering:

- pointer events -> tool state machine
- tool emits commands
- commands mutate Yjs doc
- renderer reacts to Yjs updates

### 3. Multiplayer sync

Use Yjs for shape/document state.

Use awareness for ephemeral state:

- cursor position
- selected nodes
- active tool
- viewport rectangle
- user color/name/avatar

Use your own WebSocket server for:

- auth on connect
- room join by file id
- Yjs update fanout
- awareness fanout
- comment notifications
- mention notifications

Important boundary:

The editor should never import `y-websocket` directly from random UI components.

Instead, keep one collaboration module that exposes:

```ts
type CollabClient = {
  connect: () => void;
  disconnect: () => void;
  destroy: () => void;
  getDoc: () => Y.Doc;
  getAwareness: () => Awareness;
  onStatusChange: (cb: (status: "connecting" | "connected" | "disconnected") => void) => () => void;
};
```

The rest of the app only talks to this interface.

### 3a. Provider adapter design

Create a thin abstraction:

```ts
type CollabProviderFactoryOptions = {
  fileId: string;
  userId: string;
  userName: string;
  userColor: string;
  authToken: string;
};

type CollabProviderFactory = (
  options: CollabProviderFactoryOptions
) => CollabClient;
```

Implementations:

- `createYWebSocketCollabClient`
- `createHocuspocusCollabClient`

Only one should be active at a time, selected via config.

### 3b. Shared document contract

To keep migration easy, these must not change when we swap providers:

- document room key format, example: `file:<fileId>`
- Yjs top-level keys
- awareness payload shape
- user presence color/name metadata
- file permission model
- client-side command system that mutates Yjs

Suggested awareness payload:

```ts
type PresenceState = {
  user: {
    id: string;
    name: string;
    color: string;
    avatarUrl?: string;
  };
  cursor?: { x: number; y: number };
  selection?: { nodeIds: string[] };
  viewport?: { x: number; y: number; zoom: number };
  activeTool?: "select" | "frame" | "rect" | "ellipse" | "text" | "comment";
};
```

### 3c. Auth handshake design

Do not hard-code provider-specific auth assumptions into the editor.

Use this flow:

1. user signs in through app auth
2. Next.js issues a short-lived collaboration token for a file
3. collaboration client connects using that token
4. websocket server validates token and room permissions

For `y-websocket`, the token may be passed as query params or connection metadata depending on server setup.

For Hocuspocus later, the same token can be validated in Hocuspocus auth hooks.

The important part is that the token issuer stays in the app backend and the editor only receives a token string.

### 3d. Persistence boundary

Keep persistence behind a server-side interface:

```ts
type CollabPersistence = {
  loadDocument: (fileId: string) => Promise<Uint8Array | null>;
  saveSnapshot: (fileId: string, state: Uint8Array) => Promise<void>;
  appendUpdate?: (fileId: string, update: Uint8Array) => Promise<void>;
};
```

With this split:

- `y-websocket` server can call the persistence adapter directly
- Hocuspocus can reuse the same persistence adapter later

So we do not bind storage code to a specific collaboration server.

### 3e. Transport-specific responsibilities

What belongs in the provider/server layer:

- room connection lifecycle
- awareness transport
- auth verification
- loading initial Yjs state
- saving merged state / updates

What must stay outside it:

- editor commands
- shape schema
- comments business logic
- mentions and notifications
- file permissions business rules beyond room authorization

### 3f. Comments are separate on purpose

Even after migration to Hocuspocus, comments should remain a separate app subsystem:

- comments live in Postgres
- comment events can use app websocket events or later a separate gateway
- comment mentions create notification records

This avoids coupling product features to the Yjs transport choice.

### 4. Comments

Do not put comment threads directly inside the main canvas Yjs document unless you need offline-first comments from day one.

For the MVP:

- comments in Postgres
- realtime updates over WebSocket
- optimistic UI on client

Thread model:

- thread id
- file id
- page id
- anchor type: `node` or `point`
- anchor node id or x/y coordinates
- resolved flag
- participants

Comment model:

- id
- thread id
- author id
- tiptap JSON
- created at
- updated at

Mentions:

- parse mention nodes from Tiptap JSON
- create notification rows
- broadcast badge updates / inbox events

### 5. Persistence

Persist two things separately:

1. Realtime document state
2. Product data

Realtime document state:

- persist Yjs updates or periodic merged snapshots
- keep a `latest binary snapshot`
- optionally append incremental updates for recovery/debugging

Product data:

- users
- organizations
- files
- memberships
- comments
- notifications
- assets
- version snapshots metadata

### 6. Version history

For MVP, keep it simple:

- save manual snapshots
- store snapshot id, file id, actor id, created at
- persist serialized Yjs state or JSON export

Skip full operational replay UI for now.

## What You Are Missing

These are the pieces many "Figma clone" tutorials skip:

- normalized scene graph instead of library-owned objects
- awareness vs persistent state separation
- camera model and coordinate transforms
- selection/marquee math
- robust hit testing and z-index rules
- text editing strategy inside a canvas app
- asset upload pipeline
- comment anchoring model
- mention notifications pipeline
- auth + permissions on websocket rooms
- persistence strategy for CRDT docs
- snapshots/version history
- offline/reconnect behavior
- performance strategy for thousands of nodes

## Suggested MVP Scope

### Must-have

- auth
- workspace + file list
- one collaborative canvas page
- pan/zoom
- rect / ellipse / text / frame tools
- select / move / resize / delete / duplicate
- live cursors
- multiplayer shape editing
- comments pinned to node or point
- `@mentions` in comments
- save/load file

### Nice-to-have

- image upload
- layers panel
- undo/redo
- keyboard shortcuts
- manual snapshots

### Skip for first interview MVP

- true multiplayer rich text editing inside text nodes
- boolean vector operations
- component system
- auto-layout
- multiplayer voice/video
- branching history
- plugin architecture

## Implementation Order

### Phase 1: Single-player editor

- scaffold Next.js app
- build file route: `/file/[fileId]`
- implement camera and viewport
- implement node model
- implement renderer
- implement selection + transforms
- add persistence

### Phase 2: Realtime collaboration

- add Yjs doc model
- add custom websocket server
- sync nodes and presence
- render remote cursors and selections

### Phase 3: Comments

- add comment pins on canvas
- add side panel thread list
- add Tiptap composer
- add mention suggestions
- add mention notifications

### Phase 4: Polish

- keyboard shortcuts
- undo/redo
- snapshots
- better performance
- permissions

## Concrete Folder Plan

```txt
src/
  app/
    (marketing)/
    file/[fileId]/page.tsx
    api/
      files/
      comments/
      mentions/
      assets/
  components/
    canvas/
    comments/
    inspector/
    toolbar/
  features/
    editor/
      engine/
        camera.ts
        commands.ts
        coordinate.ts
        hit-test.ts
        selection.ts
        tools/
      model/
        node-types.ts
        yjs-schema.ts
      render/
        pixi-renderer.ts
      realtime/
        awareness.ts
        provider.ts
    comments/
      composer/
      threads/
      mentions/
  server/
    db/
    auth/
    ws/
      yjs-server.ts
      comments-gateway.ts
```

## Honest Tech Choices

If you want the most believable interview answer:

- Next.js is a good shell and backend-for-frontend.
- Do not run your entire collaboration layer only through Next.js route handlers.
- Use a dedicated WebSocket server process for realtime.
- Use Yjs instead of inventing OT/CRDT logic yourself.
- Use Tiptap only for comments, not as the canvas engine.
- Use Fabric only if you need a fast prototype in 1-2 days and accept architectural debt.
- Keep `y-websocket` behind an adapter so Hocuspocus is a server migration, not an editor rewrite.

## If You Want the Fastest Path

Use this stack:

- Next.js
- PixiJS
- Yjs
- `y-websocket` first, Hocuspocus-ready architecture
- Postgres
- Redis later
- Tiptap for comments

## If You Still Want Fabric.js

Fabric is acceptable only for a very narrow MVP:

- 1 page
- small number of shapes
- basic object transforms
- no large-scene performance expectations

If you choose Fabric, isolate it behind an adapter so you can replace it later:

- `CanvasAdapter`
- `FabricCanvasAdapter`
- app state stored outside Fabric objects

Do not let Fabric objects become your database schema.

## First Build Targets

Build these in order:

1. Single-player canvas with normalized nodes
2. Pan/zoom/select/move/resize
3. Provider-agnostic Yjs collaboration client
4. `y-websocket` server and Yjs-powered shape sync
5. Live cursors and presence
6. Comment pins + threads
7. `@mentions` + notifications
8. Snapshots

## Initial File Boundaries

To protect the future migration, keep these modules separate from day one:

```txt
src/
  features/
    editor/
      collab/
        collab-client.ts
        collab-types.ts
        create-collab-client.ts
        providers/
          y-websocket.ts
          hocuspocus.ts
      model/
        yjs-schema.ts
      presence/
        awareness-state.ts
  server/
    collab/
      persistence.ts
      auth.ts
      rooms.ts
    ws/
      y-websocket-server.ts
      hocuspocus-server.ts
```

Rules:

- UI imports from `create-collab-client.ts`, never provider files directly
- server persistence imports from `server/collab/persistence.ts`
- Yjs schema is shared and provider-independent
- comments code does not import provider-specific collaboration code

## Migration Checklist: y-websocket to Hocuspocus

If we architect it this way, the migration later should mostly be:

1. implement `createHocuspocusCollabClient`
2. implement `hocuspocus-server.ts`
3. wire Hocuspocus auth to the same collaboration token issuer
4. reuse the same room naming and Yjs schema
5. reuse the same persistence adapter
6. switch config from `y-websocket` to `hocuspocus`
7. regression-test presence, reconnect, and snapshot persistence

Things that should not need a rewrite:

- editor engine
- canvas commands
- comments UI
- mentions UI
- Drizzle schema
- file pages and routes

## Sources

- Next.js App Router docs: https://nextjs.org/docs/app
- Next.js Route Handlers docs: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
- Fabric.js docs: https://fabricjs.com/docs/getting-started/installing/
- Fabric WebGL filter backend docs: https://fabricjs.com/api/classes/webglfilterbackend/
- PixiJS intro: https://pixijs.com/8.x/guides/getting-started/intro
- PixiJS renderers: https://pixijs.com/8.x/guides/components/renderers
- Yjs websocket provider: https://docs.yjs.dev/ecosystem/connection-provider/y-websocket
- Tiptap collaboration overview: https://tiptap.dev/docs/hocuspocus/introduction
- Tiptap awareness docs: https://tiptap.dev/docs/collaboration/core-concepts/awareness
- Tiptap mention extension: https://tiptap.dev/docs/editor/extensions/nodes/mention
- Tiptap comments overview: https://tiptap.dev/docs/comments/getting-started/overview
