export type Vector2D = {
    x: number,
    y: number,
};

export type CursorData = {
    pressed: boolean,
} & Vector2D;

export type ObjectData = {} & Vector2D;

export type PeerData = {
    name: string,
    cursor: CursorData,
}
export type ConnectedPeerData = PeerData & {
    connection: {
        send: (data: any) => void;
    }
};


type PeerID = string;

export type RoomData<
    PeerExtension = {},
    BaseExtension = {},
    ObjectExtension extends ObjectData = ObjectData,
> =
    BaseExtension &
    {
        peers: Record<PeerID, ConnectedPeerData & PeerExtension>,
        self: PeerData & { id: PeerID } & PeerExtension,
        objects: Record<number, ObjectExtension>,
    };

/**
 * Custom handlers for a room
 */
export type RoomMod<State = any, A = {}, B = {}, C extends ObjectData = ObjectData> = {
    state?: State,
    selfSetup?(room: RoomData<A, B, C>): void;
    peerSetup?(room: RoomData<A, B, C>, peerId: PeerID): void;
    processData?(room: RoomData<A, B, C>, data: any, peerId: PeerID): void;
    render?(room: RoomData<A, B, C>): void;
};


