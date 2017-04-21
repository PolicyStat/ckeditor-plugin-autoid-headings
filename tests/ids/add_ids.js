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
    },

    'test it will add an id when a paragraph is converted to heading': function() {
      var bot = this.editorBot,
        editor = this.editor,
        paragraph,
        heading,
        style = new CKEDITOR.style({ element: 'h1' }),
        resumeAfter = bender.tools.resumeAfter,
        startHtml = '<p>This paragraph will be converted^</p>';

      bot.setHtmlWithSelection(startHtml);
      editor.execCommand('autoid');

      paragraph = editor.editable().findOne('p');
      assert.isFalse(paragraph.hasAttribute('id'));

      resumeAfter(editor, 'idAdded', function() {
        heading = editor.editable().findOne('h1');

        assert.isTrue(heading.hasAttribute('id'));
      });

      // convert the paragraph to a heading
      editor.applyStyle(style);

      wait();
    },

    'test it will retain the id if a heading is converted to a non-heading and back': function() {
      var bot = this.editorBot,
        editor = this.editor,
        paragraph,
        heading,
        headingStyle = new CKEDITOR.style({ element: 'h1' }),
        paragraphStyle = new CKEDITOR.style({ element: 'p' }),
        resumeAfter = bender.tools.resumeAfter,
        startHtml = '<h1 id="12345">This paragraph will be converted^</h1>';

      bot.setHtmlWithSelection(startHtml);
      editor.execCommand('autoid');

      heading = editor.editable().findOne('h1');
      assert.areSame('12345', heading.getId());

      // convert to non-heading
      editor.applyStyle(paragraphStyle);

      // convert back to heading and verify id still intact
      editor.applyStyle(headingStyle);
      heading = editor.editable().findOne('h1');
      assert.areSame('12345', heading.getId());
    },

    'test mass conversion of headings': function() {
      var bot = this.editorBot,
        editor = this.editor,
        headings,
        resumeAfter = bender.tools.resumeAfter,
        headingHtml = '<h1>a</h1>',
        startHtml = headingHtml;

      for (var i = 0; i < 1000; i++) {
        startHtml += headingHtml;
      }

      resumeAfter(editor, 'allIdsComplete', function() {
        var heading,
          headings,
          currentId,
          ids = [];

        headings = editor.editable().find('h1');

        for (var i = 0; i < headings.count(); i++) {
          heading = headings.getItem(i);
          assert.isTrue(heading.hasAttribute('id'));
          currentId = heading.getAttribute('id');
          assert.areSame(-1, ids.indexOf(currentId));
          ids.push(currentId);

        }

      });

      bot.setHtmlWithSelection(startHtml);
      editor.execCommand('autoid');

      wait();
    }
  });
})();
