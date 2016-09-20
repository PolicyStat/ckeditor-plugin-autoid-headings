'use strict';

(function () {
	var editorHasFocus = false;
	var commandIsActive = false;

	CKEDITOR.plugins.add('autoid', {
		init: function (editor) {
			var self = this;

			if (editor && !editor.config.autoid) {
				editor.config.autoid = {};
			}
			self.settings = editor.config.autoid;
			if (!self.settings) {
				self.settings = {};
			}

			editor.addCommand('autoid', {
				exec: function (editor) {
					if (!commandIsActive) {
						start();
					} else {
						stop();
					}
				},
				editorFocus: true
			});

			editor.on("instanceReady", function () {
				if (self.settings.autostart !== false) {
					start()
				}
			});

			function start() {
				editor.getCommand('autoid').setState(CKEDITOR.TRISTATE_ON);
				commandIsActive = true;

				addAllIds();
			}

			function stop() {
				editor.getCommand('autoid').setState(CKEDITOR.TRISTATE_OFF);
				commandIsActive = false;
			}

			function addAllIds() {
				var headings = findAllHeadings(),
					i, heading;

				for (i = 0; i < headings.count(); i++) {
					heading = headings.getItem(i);
					if (heading.hasAttribute('id')) {
						continue;
					}
					addId(heading);
				}
			}

			function findAllHeadings() {
				return editor.document.find('h1, h2, h3, h4, h5, h6');
			}

			function addId(heading) {
				var uuid = CKEDITOR.tools.getUniqueId();
				heading.setAttributes({ id: uuid });
			}

		}
	});
})();
