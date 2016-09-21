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
        editor = this.editor,
        heading,
        resumeAfter = bender.tools.resumeAfter,
        startHtml = '<h1>This is a heading</h1>';

      bot.setHtmlWithSelection(startHtml);

      resumeAfter(editor, 'allIdsComplete', function() {
        heading = editor.editable().findOne('h1');

        assert.isTrue(heading.hasAttribute('id'));
      })

      wait();
    },

    'test it does not change the id of a heading that already has one': function() {
      var bot = this.editorBot,
        editor = this.editor,
        heading,
        resumeAfter = bender.tools.resumeAfter,
        startHtml = '<h1 id="12345">Heading with id</h1>';

      bot.setHtmlWithSelection(startHtml);

      resumeAfter(editor, 'allIdsComplete', function() {
        heading = editor.editable().findOne('h1');

        assert.areSame(heading.getId(), '12345');
      })

      wait();
    }
  });
})();
