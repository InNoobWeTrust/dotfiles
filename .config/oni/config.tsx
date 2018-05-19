
import * as React from "react"
import * as Oni from "oni-api"

export const activate = (oni: Oni.Plugin.Api) => {
    console.log("config activated")

    // Input
    //
    // Add input bindings here:
    //
    //oni.input.bind("<c-enter>", () => console.log("Control+Enter was pressed"))
    //oni.input.unbind("<c-g>") // make C-g work as expected in vim
    //oni.input.bind("<s-c-g>", () => oni.commands.executeCommand("sneak.show"))

    //
    // Or remove the default bindings here by uncommenting the below line:
    //
    // oni.input.unbind("<c-p>")

}

export const deactivate = (oni: Oni.Plugin.Api) => {
    console.log("config deactivated")
}

export const configuration = {
    //add custom config here, such as

    "ui.colorscheme": "gruvbox_dark",

    //"oni.useDefaultConfig": true,
    //"oni.bookmarks": ["~/Documents"],
    "oni.loadInitVim": true,
    "oni.useDefaultConfig": false,
    "learning.enabled": false,
    "achievements.enabled": false,
    "editor.textMateHighlighting.enabled": false,
    "editor.typingPrediction": false
    "editor.fontSize": "14px",
    "editor.fontFamily": "FuraCode Nerd Font",

    // Language Server
    "language.dart.languageServer.command": "dart_language_server",

    // UI customizations
    "ui.animations.enabled": true,
    "ui.fontSmoothing": "auto",
}
