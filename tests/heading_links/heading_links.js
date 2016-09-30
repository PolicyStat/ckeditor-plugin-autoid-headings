/* bender-tags: editor,unit */
/* bender-ckeditor-plugins: link,toolbar,autoid */

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
				'<h1 id="aa">a</h1>' +
				'<h2 id="ba">b</h2>' +
				'<h3 id="ca"></h3>' +
			'</p>'
		},
		inline: {
			name: 'inline',
			creator: 'inline',
			startupData: '<p>' +
				'<h1 id="ma">m</h1>' +
				'<h2 id="na">n</h2>' +
				'<h3 id="oa"></h3>' +
			'</p>'
		},
		divarea: {
			name: 'divarea',
			creator: 'replace',
			startupData: '<p>' +
				'<h1 id="ta">t</h1>' +
				'<h2 id="ua">u</h2>' +
				'<h3 id="wa"></h3>' +
			'</p>',
			config: {
				extraPlugins: 'divarea'
			}
		}
	};

	bender.editorsConfig = {
		extraAllowedContent: 'h1 h2 h3 h4 h5 h6 *[id]'
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
