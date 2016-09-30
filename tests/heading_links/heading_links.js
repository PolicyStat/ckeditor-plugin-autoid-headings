/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: link,toolbar */

// based off of dialog test for 'link' plugin
// https://github.com/ckeditor/ckeditor-dev/blob/master/tests/plugins/link/dialog.js

( function() {
	'use strict';

	function assertHeadingDiscovery( bot, expIds, expTextContents ) {
		bot.dialog( 'link', function( dialog ) {
			dialog.setValueOf( 'info', 'linkType', 'heading' );

			var headingOptions = dialog.getContentElement( 'info', 'heading' ).getInputElement().$.options,
				textContents = [],
				ids = [];

			for ( var i = headingOptions.length; i--; )
				ids.push( headingOptions[ i ][ 1 ].value );

			for ( i = headingOptions.length; i--; )
				textContents.push( headingOptions[ i ][ 0 ].value );

			assert.areSame( expIds.sort().join( ',' ), ids.sort().join( ',' ), 'Heading IDs discovered properly' );
			assert.areSame( expTextContents.sort().join( ',' ), textContents.sort().join( ',' ), 'Heading names discovered properly' );
		} );
	}

	bender.editors = {
		framed: {
			name: 'framed',
			creator: 'replace',
			startupData: '<p>' +
				'<a id="aa" name="ab">a</a>' +
				'<a id="ba" name="bb">b</a>' +
				'<a id="ca" name="cb"></a>' +
			'</p>'
		},
		inline: {
			name: 'inline',
			creator: 'inline',
			startupData: '<p>' +
				'<a id="ma" name="mb">m</a>' +
				'<a id="na" name="nb">n</a>' +
				'<a id="oa" name="ob"></a>' +
			'</p>'
		},
		divarea: {
			name: 'divarea',
			creator: 'replace',
			startupData: '<p>' +
				'<a id="ta" name="tb">t</a>' +
				'<a id="ua" name="ub">u</a>' +
				'<a id="wa" name="wb"></a>' +
			'</p>',
			config: {
				extraPlugins: 'divarea'
			}
		}
	};

	bender.editorsConfig = {
		extraAllowedContent: 'a[id,name]'
	};

	bender.test( {
		tearDown: function() {
			CKEDITOR.dialog.getCurrent().hide();
		},

		'test discovery of anchors (framed)': function() {
			assertAnchorDiscovery( this.editorBots.framed,
				[ 'aa', 'ba', 'ca', '' ],
				[ 'ab', 'bb', 'cb', '' ] );
		},

		'test discovery of anchors (inline)': function() {
			assertAnchorDiscovery( this.editorBots.inline,
				[ 'ga', 'ha', 'ma', 'na', 'oa', 'ta', 'ua', 'wa', '' ],
				[ 'gb', 'hb', 'mb', 'nb', 'ob', 'tb', 'ub', 'wb', '' ] );
		},

		'test discovery of anchors (divarea)': function() {
			assertAnchorDiscovery( this.editorBots.divarea,
				[ 'ta', 'ua', 'wa', '' ],
				[ 'tb', 'ub', 'wb', '' ] );
		}
	} );
} )();
