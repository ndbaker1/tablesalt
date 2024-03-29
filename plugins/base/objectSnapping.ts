import type { RoomPlugin } from "types";
import type { ObjectDescriptors, ObjectPropertiesRoomExtension } from "./objectProperties";
import type { CursorPeerExtension } from "./peerCursors";
import type { ObjectContextMenuRoomExtension } from "./objectContextMenu";

import peerCursors from "./peerCursors";
import objectProperties from "./objectProperties";
import objectContextMenu from "./objectContextMenu";
import { MOUSE_BUTTON } from "../common";

export type ObjectSnappingObjectExtension = ObjectDescriptors<{
    snap?: boolean,
}>;

export default <RoomPlugin<
    CursorPeerExtension,
    ObjectPropertiesRoomExtension & ObjectContextMenuRoomExtension,
    ObjectSnappingObjectExtension
>
    >{
        name: "objectSnapping",
        dependencies: [peerCursors.name, objectProperties.name, objectContextMenu.name],
        initialize(room) {
            room.objectContextMenuPlugin.menuOptions.set("snapping 🔳", new Map(Object.entries({
                "snapping on": (ids) => {
                    for (const id of ids) {
                        room.objects[id].descriptors.snap = true;
                    }
                },
                "snapping off": (ids) => {
                    for (const id of ids) {
                        room.objects[id].descriptors.snap = false;
                    }
                },
            })));

            window.addEventListener("mouseup", ({ button }) => {
                if (button === MOUSE_BUTTON.LEFT) {
                    const hoveredObjectIds = room.objectPropertiesPlugin.getObjectIdsUnderCursor();
                    const [topId, stackId] = [hoveredObjectIds.shift(), hoveredObjectIds.shift()];

                    if (stackId != null && topId != null) {
                        const topDescriptors = room.objects[topId].descriptors;

                        if (topDescriptors.snap != null && topDescriptors.snap) {
                            room.objectPropertiesPlugin.setObjectPosition(
                                topId,
                                room.objects[stackId].descriptors,
                                true,
                            );
                        }
                    }
                }
            });
        },
        cleanup(room) {
            room.objectContextMenuPlugin.menuOptions.delete("snapping 🔳");
        },
    };
