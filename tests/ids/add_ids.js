/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: autoid */

'use strict';

(function() {
  bender.editor = {
    config: {
      enterMode: CKEDITOR.ENTER_P,
      autoid: {
        autostart: false
      }
    }
  };

  bender.test({
    setUp: function() {
      this.editor = this.editorBot.editor;
    },

    tearDown: function() {
      this.editor.execCommand('autoid');
    },

    'test it can add a unique id to a heading': function() {
      var bot = this.editorBot,
        editor = this.editor,
        heading,
        resumeAfter = bender.tools.resumeAfter,
        startHtml = '<h1>This is a heading</h1>';

      resumeAfter(editor, 'allIdsComplete', function() {
        heading = editor.editable().findOne('h1');

        assert.isTrue(heading.hasAttribute('id'));
      });

      bot.setHtmlWithSelection(startHtml);
      editor.execCommand('autoid');

      wait();

    },

    'test it does not change the id of a heading that already has one': function() {
      var bot = this.editorBot,
        editor = this.editor,
        heading,
        resumeAfter = bender.tools.resumeAfter,
        startHtml = '<h1 id="12345">Heading with id</h1>';

      resumeAfter(editor, 'allIdsComplete', function() {
        heading = editor.editable().findOne('h1');

        assert.areSame(heading.getId(), '12345');
      });

      bot.setHtmlWithSelection(startHtml);
      editor.execCommand('autoid');

      wait();
    },

    'test it will add an id to a new heading': function() {
      var bot = this.editorBot,
        editor = this.editor,
        heading,
        resumeAfter = bender.tools.resumeAfter,
        startHtml = '<h1>This is a heading</h1>';

      bot.setHtmlWithSelection(startHtml);
      editor.execCommand('autoid');

      var newHeading = editor.document.createElement('h2');

      resumeAfter(editor, 'idAdded', function() {
        heading = editor.editable().findOne('h2');
        assert.isTrue(heading.hasAttribute('id'));
      });

      editor.insertElement(newHeading);
      editor.getSelection().selectElement(newHeading);

      wait();
    }
  });
})();
