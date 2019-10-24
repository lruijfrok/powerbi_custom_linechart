import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var linechart015544EC07FC4820A7C1D7488D65A57C_DEBUG: IVisualPlugin = {
    name: 'linechart015544EC07FC4820A7C1D7488D65A57C_DEBUG',
    displayName: 'linechart',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        console.error('Visual instance not found');
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["linechart015544EC07FC4820A7C1D7488D65A57C_DEBUG"] = linechart015544EC07FC4820A7C1D7488D65A57C_DEBUG;
}

export default linechart015544EC07FC4820A7C1D7488D65A57C_DEBUG;