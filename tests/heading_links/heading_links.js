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

		'test discovery of headings (framed)': function() {
			assertHeadingDiscovery( this.editorBots.framed,
				[ 'aa', 'ba', 'ca', '' ],
				[ 'a', 'b', '', '' ] );
		},

		'test discovery of headings (inline)': function() {
			assertHeadingDiscovery( this.editorBots.inline,
				[ 'ma', 'na', 'oa', '' ],
				[ 'm', 'n', '', '' ] );
		},

		'test discovery of headings (divarea)': function() {
			assertHeadingDiscovery( this.editorBots.divarea,
				[ 'ta', 'ua', 'wa', '' ],
				[ 't', 'u', '', '' ] );
		}
	} );
} )();
