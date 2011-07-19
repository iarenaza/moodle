/**
 * moodlelang/editor_plugin_src.js
 *
 * Copyright (c) 2011 Iñaki Arenaza <iarenaza@mondragon.edu>
 * Based on the example plugin (c) 2009 Moxiecode Systems AB
 *
 * @author  Iñaki Arenaza <iarenaza@mondragon.edu>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v2 or later
 *
 */

(function() {
    tinymce.create('tinymce.plugins.MoodlelangPlugin', {
        /**
         * Holds the list of available moodle languague packs
         *
         * @private
         */
        _langs : {},

        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         */
        init : function(ed) {
            // Retrieve the list of available languages
            this._langs = tinymce.util.JSON.parse(ed.getParam('moodlelang_langs'));

            ed.onInit.add(function() {
                // Register the special format for multilang span elements
                ed.formatter.register('moodlelang_format',
                                      {inline : 'span', classes : 'multilang', attributes : {lang : '%lang'}});
            });

            // Add a node change handler, selects the language of the selection as it changes
            ed.onNodeChange.add(function(ed, cm, n) {
                var p, c, lang;

                c = cm.get('moodlelang');
                p = ed.dom.getParent(n, 'SPAN');

                if (p && ed.dom.hasClass(p, 'multilang')) {
                    lang = ed.dom.getAttrib(p, 'lang');
                    c.select(lang);
                } else {
                    c.select('');
                }
            });
        },

        /**
         * Creates control instances based in the incoming name. This method is normally not
         * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
         * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
         * method can be used to create those.
         *
         * @param {String} n Name of the control to create.
         * @param {tinymce.ControlManager} cm Control manager to use in order to create new control.
         * @return {tinymce.ui.Control} New control instance or null if no control was created.
         */
        createControl : function(n, cm) {
            switch (n) {
            case 'moodlelang':
                var langMenu = cm.createListBox('moodlelang', {
                    title : 'moodlelang.language',

                    onselect : function(v) {
                        if (tinymce.activeEditor.selection.getContent() != '') {
                            v = v.trim();
                            if (v != '') {
                                // Apply multilang format with the language specified
                                tinymce.activeEditor.formatter.apply('moodlelang_format', {lang : v});
                            } else {
                                // Code for functions getNextNode() and getNodesInRange() taken from
                                // http://stackoverflow.com/questions/667951/how-to-get-nodes-lying-inside-a-range-with-javascript
                                //
                                // Get the next node of a given one, optionally with its child nodes
                                var getNextNode = function(node, endNode, skipChildren) {
                                    if (endNode == node) {
                                        // Reached the end node, so we are done.
                                        return null;
                                    }

                                    // If there are child nodes and we didn't come from a child node
                                    if (node.firstChild && !skipChildren) {
                                        return node.firstChild;
                                    }
                                    if (!node.parentNode) {
                                        return null;
                                    }

                                    return node.nextSibling || getNextNode(node.parentNode, endNode, true);
                                };

                                // Get all the nodes in the given range
                                var getNodesInRange = function(range) {
                                    var startNode = range.startContainer.childNodes[range.startOffset]
                                        || range.startContainer; // It's a text node
                                    var endNode = range.endContainer.childNodes[range.endOffset]
                                        || range.endContainer;

                                    if (startNode == endNode && startNode.childNodes.length === 0) {
                                        return [startNode];
                                    }

                                    var nodes = [];
                                    do {
                                        nodes.push(startNode);
                                    } while ((startNode = getNextNode(startNode, endNode)) && (startNode != endNode));

                                    return nodes;
                                };

                                var nodes = getNodesInRange(tinymce.activeEditor.selection.getRng());
                                for (var i = 0; i < nodes.length; i++) {
                                    parent = tinymce.activeEditor.dom.getParent(nodes[i], function(t) {
                                        return tinymce.activeEditor.dom.getAttrib(t, 'class') == 'multilang';
                                    });

                                    if (parent) {
                                        tinymce.activeEditor.dom.remove(parent, true);
                                    }
                                }
                            }
                        }
                    },
                });

                for (var lang in this._langs) {
                    langMenu.add(lang, this._langs[lang]);
                }

                return langMenu;
            }

            return null;
        },

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo : function() {
            return {
                longname : 'Moodlelang plugin',
                author : 'Iñaki Arenaza <iarenaza@mondragon.edu>',
                authorurl : 'http://twitter.com/iarenaza',
                infourl : 'http://moodle.org',
                version : "1.0"
            };
        },

    });

    // Register plugin
    tinymce.PluginManager.add('moodlelang', tinymce.plugins.MoodlelangPlugin);
})();

