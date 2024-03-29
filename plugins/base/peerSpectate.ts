import type { RoomPlugin, Vector2D } from "types";

import type { NamePeerExtension, SyncMessage } from "./names";
import type { ViewportRoomExtension } from "./viewport";
import type { CursorPeerExtension } from "./peerCursors";

import names from "./names";
import viewport from "./viewport";

const savedLocation: Vector2D = { x: 0, y: 0 };
let peerPointerContainer: HTMLElement;

export default <RoomPlugin<NamePeerExtension & CursorPeerExtension, ViewportRoomExtension>>{
    name: "peerSpectate",
    dependencies: [viewport.name, names.name],
    processMessage(room, data: SyncMessage, peerId) {
        if (data?.type === "identification") {
            const peerElement = peerPointerContainer.querySelector(`[peerId="${peerId}"]`);
            if (peerElement) {
                peerElement.textContent = "jump to " + room.peers[peerId].name;
            } else {
                peerPointerContainer.style.display = "grid";

                const peerPointer = createPointer();
                peerPointer.textContent = "jump to " + room.peers[peerId].name;
                peerPointer.setAttribute("peerId", peerId);
                peerPointer.onclick = () => {
                    savedLocation.x = room.viewportPlugin.position.x;
                    savedLocation.y = room.viewportPlugin.position.y;
                    // everything negative because cursor is positioned based on anchor
                    room.viewportPlugin.setPosition({
                        x: -room.peers[peerId].cursorWorld.x + window.innerWidth / 2,
                        y: -room.peers[peerId].cursorWorld.y + window.innerHeight / 2,
                    });
                };

                peerPointerContainer.appendChild(peerPointer);
            }
        }
    },
    initialize(room) {
        peerPointerContainer = document.createElement("div");
        peerPointerContainer.style.position = "fixed";
        peerPointerContainer.style.top = "50%";
        peerPointerContainer.style.left = "0";
        peerPointerContainer.style.transform = "translateY(-50%)";
        peerPointerContainer.style.display = "none";

        const selfPointer = createPointer();
        selfPointer.textContent = "jump to saved location";
        selfPointer.onclick = () => room.viewportPlugin.setPosition(savedLocation);
        peerPointerContainer.appendChild(selfPointer);

        room.viewportPlugin.elementRef.appendChild(peerPointerContainer);
    },
    handlePeerDisconnect(_, peerId) {
        peerPointerContainer.querySelector(`[peerId="${peerId}"]`)?.remove();
        // hide if alone
        if (peerPointerContainer.childElementCount === 1) {
            peerPointerContainer.style.display = "none";
        }
    },
};

function createPointer() {
    const pointerElement = document.createElement("button");
    pointerElement.style.padding = "0.5rem";
    return pointerElement;
}
