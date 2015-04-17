//Open Recently Used Items
//Open Recent File
/*global define, brackets, $*/
define(function (require, exports, module) {
    'use strict';
    var AppInit = brackets.getModule('utils/AppInit'),
        MainViewManager = brackets.getModule("view/MainViewManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        FileViewController = brackets.getModule("project/FileViewController"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Menus = brackets.getModule('command/Menus'),
        FileUtils = brackets.getModule("file/FileUtils"),
        obtainLanguaje = brackets.getLocale(),
        menuID = "avril.menu.clfofkg",
        itemMenuID_reopen = "avril.menu.item.reopen",
        itemMenuID_Clear = "avril.menu.item.clearAll",
        itemMenuID_ifADD = "avril.menu.item.ifAD",
        itemMenuID_stop = "avril.menu.item.stop",
        COMMAND_ID = "drs42kisqLyPgUvk",
        idStorage = COMMAND_ID + "data",
        prefs = PreferencesManager.getExtensionPrefs("avril.history"),
        storageDATA = localStorage.getItem(idStorage),
        simpleGetDat = storageDATA ? JSON.parse(storageDATA) : [],
        prefnumber = "items",
        prefKey = 'inWorking';
    var NAME_EXTENSION,
        menuNAME,
        titleREOPEN,
        titleCLEAR,
        titleRESET,
        titleADD,
        titleNoSupport;

    function getLanguaje() {
        if (/es/gi.test(obtainLanguaje)) {
            NAME_EXTENSION = "Mostrar Archivos Utilizados Recientemente";
            menuNAME = "Reciente";
            titleREOPEN = "Reabrir Archivo Cerrado";
            titleCLEAR = "Borrar Lista";
            titleRESET = "No guardar Historial Hasta Reiniciar Brackets";
            titleADD = "Añadir al Historial cuando el archivo está trabajando";
            titleNoSupport = "Su navegador no soporta el almacenamiento local";
        } else if (/it/gi.test(obtainLanguaje)) {
            NAME_EXTENSION = "Mostra file utilizzati di recente";
            menuNAME = "Recente";
            titleREOPEN = "Riapri archivio chiuso";
            titleCLEAR = "Cancella elenco";
            titleRESET = "Non salvare la cronologia fino al riavvio di Brackets";
            titleADD = "Aggiungere alla storia quando il file è in funzione";
            titleNoSupport = "Il tuo browser non supporta storage locale";
        } else if (/fr/gi.test(obtainLanguaje)) {
            NAME_EXTENSION = "Afficher Les Eléments Récents";
            menuNAME = "Récents";
            titleREOPEN = "Re-Ourvir Le Fichier Fermé";
            titleCLEAR = "Tout Supprimer";
            titleRESET = "Ne Sauvegarder L'historique Qu'au Prochain Démarage";
            titleADD = "Ajouter À L'historique Lorsque Le Fichier Est En Cours D'utilisation";
            titleNoSupport = "Votre Navigateur Ne Supporte Pas Le Stockage Local";
        } else {
            NAME_EXTENSION = "Show Recently Used Items";
            menuNAME = "Recent";
            titleREOPEN = "Reopen Closed File";
            titleCLEAR = "Clear Items";
            titleRESET = "Don't Save History Until Reset";
            titleADD = "Add to History When the File is Working";
            titleNoSupport = "Your browser does not support local storage";
        }
        return [
            NAME_EXTENSION,
            menuNAME,
            titleREOPEN,
            titleCLEAR,
            titleRESET,
            titleADD,
            titleNoSupport
        ];
    }
    getLanguaje();
    var menu = Menus.addMenu(menuNAME, menuID, Menus.AFTER, Menus.AppMenuBar.VIEW_MENU);

    function storageFn() {
        Dialogs.showModalDialog(COMMAND_ID, NAME_EXTENSION, titleNoSupport);
    }

    function hasDATA(n, h) {
        var tnu = n.indexOf(h);
        if (tnu > -1) {
            return true;
        } else {
            return false;
        }
    }

    function getNumItems() {
        var num_empty = "";
        var getNMB = prefs.get(prefnumber);
        var stringNMB = num_empty + getNMB;
        var returnNMB = parseInt(stringNMB, 10) || 5;
        if (returnNMB > 20) {
            return 20;
        } else if (returnNMB < 5) {
            return 5;
        } else {
            return returnNMB;
        }
    }

    function getDATA(ar) {
        if (ar.length > 0) {
            return ar.slice(-getNumItems());
        } else {
            return [];
        }
    }

    function addCommandMenu(name, id, fn, pos, rel) {
        CommandManager.register(name, id, fn);
        menu.addMenuItem(id, "", pos, rel);
    }

    function getCommandId(id) {
        return CommandManager.get(id);
    }

    function alreadyRegistered(id) {
        if (typeof getCommandId(id) === "undefined") {
            return false;
        } else {
            return true;
        }
    }

    function getPath(pt) {
        //var title = ProjectManager.makeProjectRelativeIfPossible(MainViewManager.getCurrentlyViewedFile()._path);
        var path = MainViewManager.getCurrentlyViewedPath(MainViewManager.ACTIVE_PANE);
        var registerCommand = COMMAND_ID + "_" + pt;
        return {
            path: path,
            registerCommand: registerCommand
        };
    }

    function getMenuIdItem(id) {
        var $getMenu = Menus.getMenuItem(menuID + "-" + id);
        if (typeof $getMenu === "undefined") {
            return false;
        } else {
            return true;
        }
    }

    function deleteMenu(id) {
        if (getMenuIdItem(id)) {
            menu.removeMenuItem(id);
        }
    }

    function addMenu(id, pos) {
        menu.addMenuItem(id, "", pos);
    }

    function getCHECK(id) {
        if (CommandManager.get(id).getChecked()) {
            return true;
        } else {
            return false;
        }
    }

    function getENABLED(id) {
        if (CommandManager.get(id).getEnabled()) {
            return true;
        } else {
            return false;
        }
    }

    function fileOpenForEdit(pth) {
        FileViewController.openAndSelectDocument(pth, FileViewController.PROJECT_MANAGER);
    }

    function reopen() {
        if (simpleGetDat.length > 0) {
            fileOpenForEdit(simpleGetDat[simpleGetDat.length - 2]);
        }
    }

    function clearALLmenu() {
        $.each(simpleGetDat, function (n, v) {
            deleteMenu(getPath(v).registerCommand);
        });
    }

    function addORremove() {
        clearALLmenu();
        var anotherSimpleGetDat = getDATA(simpleGetDat);
        $.each(anotherSimpleGetDat, function (n, v) {
            var $registerCommand = getPath(v).registerCommand;
            if (!alreadyRegistered($registerCommand) && !getMenuIdItem($registerCommand)) {
                addCommandMenu(v, $registerCommand, function () {
                    fileOpenForEdit(v);
                }, Menus.FIRST);
            } else if (alreadyRegistered($registerCommand) && !getMenuIdItem($registerCommand)) {
                addMenu($registerCommand, Menus.FIRST);
            }
        });
    }

    function rewrite(ar, vl) {
        var f_index = ar.indexOf(vl);
        if (hasDATA(ar, vl)) {
            if (ar[f_index] === vl) {
                ar.splice(f_index, 1);
            }
        }
    }

    function exclude() {
        //var entryded = ProjectManager.getCurrentDocument(); error
        var path = getPath().path;
        var sPath = FileUtils.getBaseName(path);
        var aPath = path.substring(path.lastIndexOf("/") + 1);
        var dPath = sPath || aPath;
        var uPath = /untitled|virusScanAvastSearch/i.test(dPath);
        if (uPath) {
            return true;
        } else {
            return false;
        }
    }

    function addButton() {
        var $path = getPath().path;
        if ($path || typeof $path === "string") {
            rewrite(simpleGetDat, $path);
            if (!hasDATA(simpleGetDat, $path) && !exclude()) {
                simpleGetDat.push($path);
                localStorage.setItem(idStorage, JSON.stringify(getDATA(simpleGetDat)));
            }
            addORremove();
        }
    }

    function disable(el, boo, ar) {
        if (boo && getENABLED(el) && ar.length === 0) {
            CommandManager.get(el).setEnabled(!boo);
        }
        if (!boo && !(getENABLED(el)) && ar.length > 0) {
            CommandManager.get(el).setEnabled(true);
        }
    }

    function clearDATA() {
        clearALLmenu();
        while (simpleGetDat.length > 0) {
            simpleGetDat.pop();
        }
        localStorage.removeItem(idStorage);
        disable(itemMenuID_Clear, true, simpleGetDat);
        disable(itemMenuID_reopen, true, simpleGetDat);
    }

    function noSaveToRestar() {
        if (getCHECK(itemMenuID_stop)) {
            CommandManager.get(itemMenuID_stop).setChecked(false);
        } else {
            CommandManager.get(itemMenuID_stop).setChecked(true);
        }
    }

    function onWorkingSetAdd() {
        prefs.set(prefKey, !prefs.get(prefKey));
        prefs.save();
    }

    function prefAndCheckChange() {
        if (prefs.get(prefKey)) {
            CommandManager.get(itemMenuID_ifADD).setChecked(true);
        }
        prefs.definePreference(prefKey, "boolean", true).on("change", function (e, data) {
            if (prefs.get(prefKey)) {
                CommandManager.get(itemMenuID_ifADD).setChecked(true);
            } else {
                CommandManager.get(itemMenuID_ifADD).setChecked(false);
            }
        });
    }

    function addImportantsMenus() {
        addCommandMenu(titleREOPEN, itemMenuID_reopen, reopen, Menus.BEFORE);
        addCommandMenu(titleCLEAR, itemMenuID_Clear, clearDATA, Menus.AFTER, itemMenuID_reopen);
        menu.addMenuDivider(Menus.BEFORE, itemMenuID_Clear);
        addCommandMenu(titleRESET, itemMenuID_stop, noSaveToRestar, Menus.AFTER, itemMenuID_Clear);
        addCommandMenu(titleADD, itemMenuID_ifADD, onWorkingSetAdd, Menus.AFTER, itemMenuID_stop);
    }

    function there() {
        addButton();
        disable(itemMenuID_Clear, false, simpleGetDat);
        disable(itemMenuID_reopen, false, simpleGetDat);
    }

    function onWorking() {
        prefs.set(prefKey, !!prefs.get(prefKey));
        prefs.save();
        addImportantsMenus();
        MainViewManager.on("currentFileChange", function () {
            if (!prefs.get(prefKey) && !(getCHECK(itemMenuID_stop))) {
                there();
            }
        }).on("workingSetAdd", function () {
            if (prefs.get(prefKey) && !(getCHECK(itemMenuID_stop))) {
                there();
            }
        });
    }

    function addItemsNum() {
        if (!prefs.get(prefnumber)) {
            prefs.set(prefnumber, 5);
            prefs.save();
        }
    }

    function everADD() {
        var anotherSimpleGetDat = getDATA(simpleGetDat);
        $.each(anotherSimpleGetDat, function (n, v) {
            var $registerCommand = getPath(v).registerCommand;
            addCommandMenu(v, $registerCommand, function () {
                fileOpenForEdit(v);
            }, Menus.FIRST);
        });
    }

    function stayADD() {
        window.setTimeout(function () {
            everADD();
        }, 100);
    }

    function stay() {
        if (!localStorage) {
            storageFn();
        } else {
            addItemsNum();
            stayADD();
            onWorking();
            disable(itemMenuID_Clear, true, simpleGetDat);
            disable(itemMenuID_reopen, true, simpleGetDat);
            prefAndCheckChange();
        }
    }
    AppInit.appReady(stay);
});
