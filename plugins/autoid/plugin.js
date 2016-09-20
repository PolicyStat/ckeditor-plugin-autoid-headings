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

				addAllAnchors();
			}

			function stop() {
				editor.getCommand('autoid').setState(CKEDITOR.TRISTATE_OFF);
				commandIsActive = false;
			}

		}
	});
})();
