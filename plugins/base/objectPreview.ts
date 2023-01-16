import type { RoomPlugin } from "types";
import type { ObjectPropertiesObjectExtension, ObjectPropertiesRoomExtension, OBJECT_ID_ATTRIBUTE } from "./objectProperties";
import type { ObjectContextMenuRoomExtension } from "./objectContextMenu";
import type { ViewportAnchorRoomExtension } from "./viewportAnchor";

import objectProperties from "./objectProperties";
import objectContextMenu from "./objectContextMenu";
import viewportAnchor from "./viewportAnchor";

export default <RoomPlugin<
    object,
    ObjectPropertiesRoomExtension & ObjectContextMenuRoomExtension & ViewportAnchorRoomExtension,
    ObjectPropertiesObjectExtension
>
    >{
        name: "objectPreview",
        dependencies: [objectProperties.name, objectContextMenu.name, viewportAnchor.name],
        initialize(room) {
            room.objectContextMenuPlugin.menuOptions.set("preview 👀", (ids) => {
                function closeWindow() {
                    previewContainer.remove();
                    window.removeEventListener("mouseup", closeWindow);
                }
                window.addEventListener("mouseup", ({ button }) => {
                    if (button === 0) {
                        closeWindow();
                    }
                });

                const previewContainer = document.createElement("div");
                previewContainer.style.position = "fixed";
                previewContainer.style.display = "grid";
                previewContainer.style.borderRadius = "5px";
                previewContainer.style.backgroundColor = "#322F3D";
                previewContainer.style.boxShadow = "black 1px 4px 12px";

                previewContainer.style.top = "10vh";
                previewContainer.style.left = "50%";
                previewContainer.style.transform = "translateX(-50%)";

                const closeButton = document.createElement("button");
                closeButton.textContent = "close ✖";
                closeButton.style.padding = "0.2rem";
                closeButton.style.height = "2rem";
                closeButton.style.margin = "0.6rem";
                closeButton.onclick = closeWindow;
                previewContainer.appendChild(closeButton);

                const itemContainer = document.createElement("div");
                itemContainer.style.padding = "1rem";
                itemContainer.style.display = "grid";
                itemContainer.style.gridTemplateColumns = "repeat(auto-fill, 80px)";
                itemContainer.style.gap = "1rem";
                itemContainer.style.overflow = "auto";
                itemContainer.style.width = "50vw";
                itemContainer.style.maxHeight = "50vh";
                previewContainer.appendChild(itemContainer);

                ids.forEach((id, index) => {
                    const objectPreview = document.createElement("div");
                    objectPreview.style.textAlign = "center";

                    const text = document.createElement("small");
                    text.textContent = index.toString();

                    const image = document.createElement("img");
                    image.src = room.objects[id].descriptors.currentImg ?? "";
                    image.setAttribute(<OBJECT_ID_ATTRIBUTE>"object-id", id.toString());
                    image.width = 80;

                    objectPreview.appendChild(image);
                    objectPreview.appendChild(text);
                    itemContainer.appendChild(objectPreview);
                });

                room.viewportAnchorPlugin.elementRef.appendChild(previewContainer);
            });
        },
        cleanup(room) {
            room.objectContextMenuPlugin.menuOptions.delete("preview 👀");
        },
    };
