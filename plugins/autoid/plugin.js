'use strict';

(function () {
	CKEDITOR.plugins.add('autoid', {
		init: function (editor) {

			if (editor && !editor.config.autoid) {
				editor.config.autoid = {};
			}
			this.settings = editor.config.autoid;
			if (!this.settings) {
				this.settings = {};
			}

		}
	});
})();
