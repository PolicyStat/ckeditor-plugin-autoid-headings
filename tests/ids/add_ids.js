/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: autoid */

'use strict';

(function() {
  bender.editor = {
    config: {
      enterMode: CKEDITOR.ENTER_P
    }
  };

  bender.test({
    setUp: function() {
      this.editor = this.editorBot.editor;
    },

    'test it can add a unique id to a heading': function() {
      var bot = this.editorBot,
        heading,
        startHtml = '<h1>This is a heading</h1>';

      bot.setHtmlWithSelection(startHtml);

      heading = this.editor.editable().findOne('h1');

      assert.isTrue(heading.hasAttribute('id'));
    },

    'test it does not change the id of a heading that already has one': function() {
      var bot = this.editorBot,
        heading,
        startHtml = '<h1 id="12345">Heading with id</h1>';

      bot.setHtmlWithSelection(startHtml);

      heading = this.editor.editable().findOne('h1');

      assert.isEqual(heading.getId(), '12345');
    }
  });
})();
