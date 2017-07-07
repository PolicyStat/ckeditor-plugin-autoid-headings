'use strict';

(function () {
  var ALPHABET = '23456789abdegjkmnpqrvwxyz';
  var ID_LENGTH = 5;
  var EVENT_NAMES = {
    ALL_IDS_COMPLETE: 'allIdsComplete',
    ID_ADDED: 'idAdded',
    ID_RETAINED: 'idRetained'
  };

  CKEDITOR.plugins.add('autoid', {
    init: function (editor) {
      var self = this;

      // This configures the Advanced Content Filter to allow all headings
      // to have id attributes
      editor.addFeature({
        allowedContent: 'h1 h2 h3 h4 h5 h6 *[id]'
      });

      if (editor && !editor.config.autoid) {
        editor.config.autoid = {};
      }
      self.settings = editor.config.autoid;
      if (!self.settings) {
        self.settings = {};
      }

      editor.addCommand('autoid', {
        exec: function (editor) {
          var autoId = editor.getCommand('autoid');
          autoId.toggleState();
          if (autoId.state === CKEDITOR.TRISTATE_ON)
            addAllIds();
        },
        editorFocus: true
      });

      editor.on("instanceReady", function () {
        if (self.settings.autostart !== false) {
          editor.getCommand('autoid').setState(CKEDITOR.TRISTATE_ON);
          addAllIds();
        }
      });

      CKEDITOR.on('dialogDefinition', modifyLinkDialog);

      editor.on('selectionChange', addIdIfNewHeading);

      editor.on('paste', checkPastedContentForHeadings);

      function addAllIds() {
        var headings = findAllHeadings(editor),
          i, heading;

        for (i = 0; i < headings.count(); i++) {
          heading = headings.getItem(i);
          if (heading.hasAttribute('id')) {
            continue;
          }
          addId(heading);
        }
        editor.fire(EVENT_NAMES.ALL_IDS_COMPLETE);
      }

      function findAllHeadings(editor) {
        return editor.editable().find('h1, h2, h3, h4, h5, h6');
      }

      function findHeadingIds(headings) {
        var ids = [],
          i, heading, id;

        for (i = 0; i < headings.count(); i++) {
          heading = headings.getItem(i);
          if (id = heading.getAttribute('id')) {
            ids.push(id)
          }
        }
        return ids;
      }

      function addId(heading) {
        var uuid = createAutoId();
        heading.setAttributes({ id: uuid });
        editor.fire(EVENT_NAMES.ID_ADDED);
      }

      function generateUniqueId() {
          var uniqueId = '';
          for (var i = 0; i < ID_LENGTH; i++) {
            uniqueId += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
          }
          return uniqueId;
        }

      function createAutoId() {
        // adapted from http://fiznool.com/blog/2014/11/16/short-id-generation-in-javascript/
        // who did a great job on characters to exclude, etc.
        var uid;
        var existingIds = findHeadingIds(findAllHeadings(editor));

        while (!uid) {
          uid = generateUniqueId();
          if (existingIds.indexOf(uid) !== -1) {
            uid = null;
          }
        }

        return 'autoid-' + uid;
      }

      function addIdIfNewHeading() {
        var path = editor.elementPath();

        var evaluator = function(element) {
          return isHeading(element) && !element.hasAttribute('id');
        }

        var element = path.contains(evaluator);
        if (element) {
          addId(element);
        }
      }

      function isHeading(element) {
        return element.is('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
      }

      function checkPastedContentForHeadings(ev) {
        var pastedContent = ev.data.dataValue,
          pastedContentAsHtml = CKEDITOR.htmlParser.fragment.fromHtml(pastedContent),
          pastedElements = pastedContentAsHtml.children,
          writer = new CKEDITOR.htmlParser.basicWriter(),
          i, element, id, originalHeading;

        for (i = 0; i < pastedElements.length; i++) {
          element = pastedElements[i];
          if (element.type === CKEDITOR.NODE_ELEMENT) {
            id = element.attributes.id;
            originalHeading = checkForDuplicateId(id);
            if (originalHeading) {
              element = resolveDuplicateIds(element, originalHeading);
            }
          }
        }

        pastedContentAsHtml.writeHtml(writer);
        ev.data.dataValue = writer.getHtml();
      }

      function checkForDuplicateId(id) {
        var headingIds = findHeadingIds(findAllHeadings(editor)),
          i, headingId, originalHeading;

        for (i = 0; i < headingIds.length; i++) {
          headingId = headingIds[i];
          if (id === headingId) {
            return originalHeading = editor.document.getById(headingId);
          }
        }
      }

      function resolveDuplicateIds(newHeading, originalHeading) {
        var newHeadingText = newHeading.children[0].value,
          originalHeadingText = originalHeading.getText();

        // if the original heading has no content (blank or just a line-feed
        // character is left when all the content is cut), the original heading
        // will be removed and the new heading will retain the id
        if ( originalHeadingText.length <= 1 && notWordCharacter(originalHeadingText.charAt(0))) {
          originalHeading.remove();
          editor.fire(EVENT_NAMES.ID_RETAINED);
          return newHeading;
        }

        // if the original heading text is not blank, the original should retain its
        // id and the new heading should get a new one.
        if (originalHeadingText) {
          newHeading.attributes.id = createAutoId();
          editor.fire(EVENT_NAMES.ID_ADDED);
          return newHeading;
        }

      }

      function notWordCharacter(character) {
        if (!character)
          return true;

        return !(/\w/.test(character));
      }

      // This modifies the dialog for the 'link' plugin to allow the option of
      // internal document linking to autoid headings. Original 'link' plugin
      // code can be found at:
      // https://github.com/ckeditor/ckeditor-dev/tree/master/plugins/link

      var initialLinkText, dialogEditor;

      function modifyLinkDialog(ev) {
        var dialog = ev.data;

        if (dialog.name == 'link') {
          var def = ev.data.definition,
            dialogEditor = def.dialog.getParentEditor(),
            infoTab = def.contents[0],
            linkTypeTab = findLinkTypeTab(infoTab);

          if (!headingTypeAdded(linkTypeTab)) {
            // Add option for heading links to linkType dropdown
            linkTypeTab.items.push(['Link to heading in the text', 'heading']);

            // Add additional content to 'Link Info' tab for heading links
            infoTab.elements.push(createHeadingLinkContent(dialogEditor));

            // Modify linkType's 'onChange' function to accomodate new heading option
            linkTypeTab.onChange = modifiedLinkTypeChanged;

            // Modify main dialog 'onShow' and 'onOk' function to handle heading data
            def.onShow = modifiedOnShow;
            def.onOk = modifiedOnOk;
          }
        }
      }

      function headingTypeAdded(linkTypeTab) {
        for ( var i = 0; i < linkTypeTab.items.length; i++ ) {
          var item = linkTypeTab.items[i];
          if ( item[1] === 'heading' )
            return true;
        }
      }

      function findLinkTypeTab(infoTab) {
        for ( var i = 0; i < infoTab.elements.length; i++ ) {
          var element = infoTab.elements[i];
          if ( element.id === "linkType" )
            return element;
        }
      }

      function modifiedLinkTypeChanged() {
        var dialog = this.getDialog(),
          partIds = [ 'urlOptions', 'anchorOptions', 'emailOptions', 'headingOptions' ],
          typeValue = this.getValue(),
          uploadTab = dialog.definition.getContents( 'upload' ),
          uploadInitiallyHidden = uploadTab && uploadTab.hidden;

        if ( typeValue == 'url' ) {
          if ( editor.config.linkShowTargetTab )
            dialog.showPage( 'target' );
          if ( !uploadInitiallyHidden )
            dialog.showPage( 'upload' );
          } else {
            dialog.hidePage( 'target' );
          if ( !uploadInitiallyHidden )
            dialog.hidePage( 'upload' );
        }

        for ( var i = 0; i < partIds.length; i++ ) {
          var element = dialog.getContentElement( 'info', partIds[ i ] );
          if ( !element )
            continue;

          element = element.getElement().getParent().getParent();
          if ( partIds[ i ] == typeValue + 'Options' )
            element.show();
          else
            element.hide();
        }

        dialog.layout();
      }

      function createHeadingLinkContent(editor) {
        var headings;

        return {
          type: 'vbox',
          id: 'headingOptions',
          children: [ {
            type: 'select',
            id: 'heading',
            label: 'Select a Heading',
            style: 'width : 100%;',
            items: [ [ '' ] ],
            setup: function( data ) {
              this.clear();
              this.add( [ '' ] );

              headings = findAllHeadings(editor);

              if (headings && headings.count()) {
                this.getElement().show();

                for (var i = 0; i < headings.count(); i++) {
                  var heading = headings.getItem(i);
                  this.add( heading.getText(), heading.getId() );
                }

                if ( data.type && data.type === 'heading' )
                  this.setValue( data.anchor.id );
              }
              else {
                this.getElement().hide();
              }
            },
            commit: function(data) {
              if (!data.heading)
                data.heading = {};

              data.heading.id = this.getValue();
              // set the data type to 'anchor' since the procedure is the same
              // for headings.  This way, we don't have to modify the main
              // 'plugin.js' for 'link' to handle a new link type.
              if (data.heading.id)
                data.type = 'anchor';
            }
          },
          {
            type: 'html',
            id: 'noHeadings',
            style: 'text-align: center;',
            html: '<div role="note" tabIndex="-1">' + CKEDITOR.tools.htmlEncode( '(No headings created yet in the document)' ) + '</div>',
            // Focus the first element defined in above html.
            focus: true,
            setup: function() {
              this.getElement()[ headings && headings.count() ? 'hide' : 'show' ]();
            }
          } ]
        }
      }

      function modifiedOnShow() {
        var editor = this.getParentEditor(),
          selection = editor.getSelection(),
          selectedElement = selection.getSelectedElement(),
          displayTextField = this.getContentElement( 'info', 'linkDisplayText' ).getElement().getParent().getParent(),
          element = null,
          plugin = CKEDITOR.plugins.link,
          initialLinkText = this.getValueOf('info', 'linkDisplayText');

        // Fill in all the relevant fields if there's already one link selected.
        if ( ( element = plugin.getSelectedLink( editor ) ) && element.hasAttribute( 'href' ) ) {
          // Don't change selection if some element is already selected.
          // For example - don't destroy fake selection.
          if ( !selectedElement ) {
            selection.selectElement( element );
            selectedElement = element;
          }
        } else {
          element = null;
        }

        // Here we'll decide whether or not we want to show Display Text field.
        if ( plugin.showDisplayTextForElement( selectedElement, editor ) ) {
          displayTextField.show();
        } else {
          displayTextField.hide();
        }

        var data = plugin.parseLinkAttributes( editor, element );

        // Record down the selected element in the dialog.
        this._.selectedElement = element;

        if (data.anchor && data.anchor.id.match(/autoid-/))
          data.type = 'heading';

        this.setupContent( data );
      }

      function modifiedOnOk() {
        var data = {},
          editor = this.getParentEditor(),
          plugin = CKEDITOR.plugins.link;

        // Collect data from fields.
        this.commitContent( data );

        // if there is a heading id and not an anchor id, the user is creating
        // a link to a heading.  We set value of the heading id to the anchor.id
        // property so it will create the new link without having to
        // modify the plugin further
        if (data.heading.id && !data.anchor.id)
          data.anchor.id = data.heading.id;

        var selection = editor.getSelection(),
          attributes = plugin.getLinkAttributes( editor, data ),
          bm,
          nestedLinks;

        if ( !this._.selectedElement ) {
          var range = selection.getRanges()[ 0 ],
            text;

          // Use link URL as text with a collapsed cursor.
          if ( range.collapsed ) {
            // Short mailto link text view (#5736).
            text = new CKEDITOR.dom.text( data.linkText || ( data.type == 'email' ?
              data.email.address : attributes.set[ 'data-cke-saved-href' ] ), editor.document );
            range.insertNode( text );
            range.selectNodeContents( text );
          } else if ( initialLinkText !== data.linkText ) {
            text = new CKEDITOR.dom.text( data.linkText, editor.document );

            // Shrink range to preserve block element.
            range.shrink( CKEDITOR.SHRINK_TEXT );

            // Use extractHtmlFromRange to remove markup within the selection. Also this method is a little
            // smarter than range#deleteContents as it plays better e.g. with table cells.
            editor.editable().extractHtmlFromRange( range );

            range.insertNode( text );
          }

          // Editable links nested within current range should be removed, so that the link is applied to whole selection.
          nestedLinks = range._find( 'a' );

          for	( var i = 0; i < nestedLinks.length; i++ ) {
            nestedLinks[ i ].remove( true );
          }

          // Apply style.
          var style = new CKEDITOR.style( {
            element: 'a',
            attributes: attributes.set
          } );

          style.type = CKEDITOR.STYLE_INLINE; // need to override... dunno why.
          style.applyToRange( range, editor );
          range.select();
        } else {
          // We're only editing an existing link, so just overwrite the attributes.
          var element = this._.selectedElement,
            href = element.data( 'cke-saved-href' ),
            textView = element.getHtml(),
            newText;

          element.setAttributes( attributes.set );
          element.removeAttributes( attributes.removed );

          if ( data.linkText && initialLinkText != data.linkText ) {
            // Display text has been changed.
            newText = data.linkText;
          } else if ( href == textView || data.type == 'email' && textView.indexOf( '@' ) != -1 ) {
            // Update text view when user changes protocol (#4612).
            // Short mailto link text view (#5736).
            newText = data.type == 'email' ? data.email.address : attributes.set[ 'data-cke-saved-href' ];
          }

          if ( newText ) {
            element.setText( newText );
            // We changed the content, so need to select it again.
            selection.selectElement( element );
          }

          delete this._.selectedElement;
        }
      }
    }
  });
})();
