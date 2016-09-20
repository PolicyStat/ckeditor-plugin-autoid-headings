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

				for (i = 0; i < headings.length; i++) {
					heading = headings[i];
					if (heading.hasAttribute('id')) {
						continue;
					}
					addId(heading);
				}
			}
		}
	});
})();
