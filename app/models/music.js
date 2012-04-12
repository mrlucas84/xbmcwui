
var xbmcmusic = {

	/*********************************************************************************************
	 * Lists
	 ********************************************************************************************/		

	

	/* Music Home */	
	getHome: function(){
		xbmcmusic.getArtists();
	},	
	
	

	
		
	//for drag and drop
	dragOptions: { 
		revert: true, 
		zIndex: 500, 
		revertDuration: 0,  
		opacity: 0.4, 
		start: function(e, ui){ 
			var el = $(ui.helper[0]);
			if(el.hasClass('protector')){
				var str = '';
				$('.songs li.selected').each(function(i,o){
					str += (str != '' ? ', ' : '') + $(o).find('.col-name .text').html();
				});
				if(str == ''){ str = '1 song'; }
				var count = $('.songs li.selected').length;				
				el.html('Adding: ' + str ); 
			}			
		},
		stop: function(e, ui){ 
			var el = $(ui.helper[0]);
			if(el.hasClass('protector')){
				el.html(' '); 
			}
		},
		connectToSortable: ".custom-playlist ul.songs",
		helper: "clone"
	}, 
	
	/* Playing / playlist */
	getPlayingPage: function(){
			
		var structure = {
				   classes: "xbmc-playlist-buttons",
				   data: { 'plid': 0},
				   items: [ 
				   	{ classes: "action", data: { task: "op-pl-play-browser" }, title: "Play in Browser" },  
				   	{ classes: "action", data: { task: "op-pl-export" }, title: "Export" },
				   	{ classes: "action", data: { task: "op-pl-clear" }, title: "Clear" }
				   ]
			  };
			  
		var menu = templates.makeButtonMenu(structure);
		
		var out = '<div id="now-playing-region">';		
		if(xbmcapi.nowplaying.item != undefined){			
			out += templates.nowPlayingBlock(xbmcapi.nowplaying);								
		}
		out += '</div><h3>XBMC Playlist</h3>' + menu + '<div id="playlist"></div>';
		
		router.buildPage( 'op=playlist', out );		
		xbmcapi.getCurrentPlaylist( templates.getPlaylistPage );		
		$('ul.nav li a#pl-0').addClass('active');
	},	
		
		
	/* Genres */	
	getGenres: function(){		
		xbmcmusic.themeGenreList();
		//xbmcapi.getMusicGenres( xbmcmusic.themeGenreList );		
	},
	themeGenreList: function(result){
		
		var content = '<h3>Genres</h3>' + templates.genreList(xbmcapi.allmusicgenres, 0, true)  + 
					  '<a href="#more" class="op-more-genres pager-more" data-pagenum="1" >More Results</a>';
		
		
		
		router.buildPage( 'op=genres', content );
		$('body').scrollTo(0);
		$('ul.nav li a.op-genres').addClass('active');

		
	},
		
	getGenre: function(genreName){
		
		var genre = xbmcapi.songByGenre[ genreName ];		
		
		//build page
		var page = '<div id="artist-page"><div class="genre-header">' + 
					'<h3>' + genre.label + '</h3></div>' +  
				    templates.albumList( genre.albums ) + 
				   '</div>';
				
		router.buildPage( 'op=genre&id=h' + xbmcmusic.hashCode(genre.label), page );
		
		$('body').scrollTo( 0 , 300); 
		$('ul.nav li a.op-genres').addClass('active');				
	},
	
	
	
		
	/* Artists */	
	getArtists: function(){		
		xbmcapi.getArtists( xbmcmusic.themeArtistsList );	
	},
	themeArtistsList: function(result){	
				
		//console.log(result);
		var content = templates.artistsList(result, 0, true) + '<a href="#more" class="op-more-artists pager-more" data-pagenum="1" >More Results</a>';
		router.buildPage( 'op=artists', content );	
		router.scrollTo( '#letter-a' );
		
		$('ul.nav li a.op-artists').addClass('active');
		
	},
	
	
	
	/* Artist */	
	getArtist: function(id, albumid){		
		
		var albumList = [];
		var artistName = '';
		
		for (var i in xbmcapi.parsedsongs){
			var a = xbmcapi.parsedsongs[i];
			if(a.artistid == id){ //match here
				albumList.push(a);
				artistName = a.artist;
			}
		}
		
		//build page
		var page = '<div id="artist-page"><div class="artist-header">' + templates.artistMenu( xbmcapi.getArtist(id) ) + 
					'<h3>' + artistName + '</h3></div>' +  
				    templates.albumList( albumList ) + 
				   '</div>';
		
		
		router.buildPage( 'op=artist&id=' + id, page );
		
		if(albumid != undefined && albumid != ''){
			router.scrollTo( '#album-row-' + albumid );
		} else {
			$('body').scrollTo( '0px', 300 );
		}
		
		$('ul.nav li a.op-artists').addClass('active');
	},


	
	/* Albums */	
	getAlbums: function(){	

		var out = templates.albumGalleryList(xbmcapi.parsedsongs, 0, true) + '<a href="#more" class="op-more-albums pager-more" data-pagenum="1" >More Results</a>';				
		router.buildPage( 'op=albums', out );	
		router.scrollTo( '#letter-a' );

		$('ul.nav li a.op-albums').addClass('active');		
			
	},
	
		
			
	/* Songs */	
	getSongs: function(){		
		
		var out = templates.albumList(xbmcapi.parsedsongs, 0, true) + '<a href="#more" class="op-more-songs pager-more" data-pagenum="1" >More Results</a>';				
		router.buildPage( 'op=songs', out );	
		$('body').scrollTo( 0 , 300);		 
		
		$('ul.nav li a.op-songs').addClass('active');

	},
	
	
	
	//default options for playing something
	playDefaults: {
		 	position: 0,
			fieldName: "artistid",
			fieldValue: 0,
			playlistAction: "replace",
			play: true
	},
	
	
	
	selectedItems: function(type){
		var selected = 0, css = '';
		
		$('.' + type + '-list .tracks li.selected').each(function(i,o){
			selected++;
		});
		
		css = 'selected-' + type + '-songs';
		
		if(selected > 0){
			$('body').addClass(css);
		} else {
			$('body').removeClass(css);
		}		
			
	},
	
	
	
	getSimilarMusic: function(song){
		
		var songlist = [], genrelist = [], artistlist = [], artistslist = {}, allartists = [], used = {};
		
		//get related from genre
		if(song.genre != undefined && song.genre != ''){
			var genre = xbmcapi.songByGenre[ song.genre ];
			$(genre.items).each(function(i,s){
				if(s.songid != song.songid){
					s.source = 'genre';
					songlist.push(s);
					genrelist.push(s);
					if(artistslist[s.artist] == undefined && s.artistid != song.artistid){
						allartists.push({label: song.artist, artistid: song.artistid});
					}
					used[ s.songid ] = true;
				}				
			});
		}
		
		//get related from artist
		if(song.artistid != undefined && song.artistid != ''){
			var artist = xbmcapi.getArtist(song.artistid); 
			if(artist != undefined){
				$(artist.items).each(function(i,album){
					$(album.items).each(function(i,s){
						if(s.songid != song.songid && used[ s.songid ] == undefined){
							s.source = 'artist';
							songlist.push(s);
							artistlist.push(s);
							used[ s.songid ] = true;
						}				
					});		
				});
			}
		}		
		
		
		//ready for output	
		var out = {
			genreSongs: genrelist,
			artistSongs: artistlist,
			allSongs: songlist,
			allAlbums: xbmcapi.parseGenericSongSet(songlist),
			allartists: allartists
		};
		
		return out;
		
	},
	
	
	
	
	
	
	/*********************************************************************************************
	 * Playlist
	 ********************************************************************************************/	
	
	
	
	
	reorderPlaylist: function(e,p){
		
		
		var newQueue = [];
		var synced = 1;
		
		//get list of items in the new order
		$('#playlist .song').each(function(i,o){
			var obj = $(o);
			var pos = obj.attr('data-position');
			var song = {'songid' : obj.attr('data-songid'), 'file' : obj.attr('data-file')};
			
			if(i != pos){ synced = 0; }
			
			newQueue.push( song );
						
		});
		
		//only if something has changed postition do we rebuild the playlist
		if(synced == 0){
			//rebuild in correct order
			xbmcapi.playlistClear(function(){
				xbmcapi.playlistAddMixed(0, newQueue, xbmcmusic.resyncPlaylist );
			});			
		}

	},	
	
	resyncPlaylist: function(){	
		
		//xbmcmusic.getPlayingPage();	
	},
	
	
	/*********************************************************************************************
	 * Binds
	 ********************************************************************************************/	

	binds: function(){
		
		/**
		 * Music Binds
		 */	
				
		//menuget
		$('.op-playing').live('click', function(e){ e.preventDefault(); xbmcmusic.getPlayingPage();  });
		$('.op-genres').live('click', function(e){ e.preventDefault(); xbmcmusic.getGenres();  });
		$('.op-artists').live('click', function(e){ e.preventDefault(); xbmcmusic.getArtists();  });
		$('.op-albums').live('click', function(e){ e.preventDefault(); xbmcmusic.getAlbums();  });
		$('.op-songs').live('click', function(e){ e.preventDefault(); xbmcmusic.getSongs();  });
			
		
		$('.album-item .cover:not(.ui-draggable)').liveDraggable( xbmcmusic.dragOptions );
		
		$('.custom-playlist-list li .protector:not(.ui-draggable), .library-list li .protector:not(.ui-draggable)').liveDraggable( xbmcmusic.dragOptions );
		
		$('.artist-list .covers:not(.ui-draggable)').liveDraggable( xbmcmusic.dragOptions );
		
		$('.genre-list .covers:not(.ui-draggable)').liveDraggable( xbmcmusic.dragOptions );
		
		$('.download-song').live('click', function(){ 
			var song = xbmcapi.getSong($(this).attr('data-id'));
			xbmcapi.prepareDownload( song.file, router.download ); 
		});
		
		
		//sortable playlist items
	
		$('#playlist ul.songs:not(.ui-sortable)').live('mouseover', function(){		//songs	
			$(this).sortable({
				'handle' : '.reorder-handle',
				'items' : 'li.song',
				'axis': 'y',
				'stop' : function(e, p){ xbmcmusic.reorderPlaylist(e, p);  },
				'connectWith' : "#playlist ul.songs"
			});
		});		
		$('#playlist .album-list:not(.ui-sortable)').live('mouseover', function(){		 //albums	
			$(this).sortable({
				'handle' : '.wui-menu',
				'axis': 'y',
				'items' : 'div.album-row-item',
				'stop' : function(e, p){ xbmcmusic.reorderPlaylist(e, p);  }
			});
		});	

		
		//prepare a play object
		var playParams = xbmcmusic.playDefaults;
		
		//song rows - @TODO - test if browser allows double click
		$('.library-list .tracks li').live('dblclick', function(e){ 	
			e.preventDefault();
			var p = $(this);	
			browserplayer.setPlayer('xbmc');
			xbmcapi.playMusic({
					 	position: p.attr('data-position'),
						fieldName: 'albumid',
						fieldValue: p.attr('data-albumid'),
						playlistAction: "replace",
						play: true
				}, nowplaying.update );
		});	
		$('.song-list li.song').live('click', function(e){ 
			e.preventDefault();

			$(this).toggleClass('selected');
			xbmcmusic.selectedItems('library');

		});
		//selected actions
		$('.op-deselect-all-songs').live('click', function(e){ 	
			e.preventDefault();	
			$('.tracks li').removeClass('selected');
			xbmcmusic.selectedItems('library');	
		});	
		//add to end of playlist
		$('.op-add-selected-songs').live('click', function(e){ 	
			e.preventDefault();	
			var queue = [];
			
			$('.library-list .tracks li.selected').each(function(i,o){
				var obj = $(o);
				queue.push(obj.attr('data-songid'));				
			});			
			xbmcapi.playlistAddSongs(0, queue, false);
			$('.library-list .tracks li').removeClass('selected');
			xbmcmusic.selectedItems('library');	
			mainapp.notify('start', 'Music added to the playlist', 1);
			
		});			
		//clear playlist first, play after.
		$('.op-play-selected-songs').live('click', function(e){ 	
			e.preventDefault();	
			var queue = [];
			$('.library-list .tracks li.selected').each(function(i,o){
				var obj = $(o);
				queue.push(obj.attr('data-songid'));				
			});	
			
			xbmcapi.playlistClear(function(response){ 
				console.log(queue);
				xbmcapi.playlistAddSongs(0, queue, 'play');				
			});
		
			$('.library-list .tracks li').removeClass('selected');
			xbmcmusic.selectedItems('library');	
			mainapp.notify('start', 'Playlist cleared, new songs added, now playing the first song', 1);
		});				
		
		
		
		
		//playlist song rows
		$('.playlist-list .song-list li').live('dblclick', function(e){ 	
			e.preventDefault();
			var p = $(this);	
			xbmcapi.playPlaylistPosition(p.attr('data-position'), nowplaying.update ); 
		});	
		$('.playlist-list .song-list li').live('click', function(e){ 
			e.preventDefault();
			//$('.playlist-list .song-list li').removeClass('selected');
			//$(this).addClass('selected');
		});	
		
		//remove item button
		$('.op-playlist-remove-item').live('click', function(e){
			e.preventDefault();
		
			var o = $(this).parent().parent();			
			var position = o.attr('data-position') ; 
			
			xbmcapi.playlistRemoveItem(position, nowplaying.update );					
			o.remove();	
			
			//correct the position numbers
			$('#playlist .song-list li').each(function(i,o){ 
				$(o).attr('data-position', i );
			});			
		});

		
		//songs pager button
		$('.op-more-songs').live('click', function(e){
			e.preventDefault();
			templates.pagerAction('.album-list', '.op-more-songs', xbmcapi.parsedsongs, templates.albumList, true);			
		});			
				
			
		//albums
		$('.album-gallery-list .album-item .cover, #playlist .album-item .magic-box, .view-album img').live('click', function(e){ 
			e.preventDefault();		
			var artist = $(this).parent(); 
			xbmcmusic.getArtist( artist.attr('data-artistid'), artist.attr('data-albumid') );			
		});	
		//album - play
		$('.action-play-album').live('click', function(){
			var id = $(this).attr('data-albumid');
			xbmcapi.playMusic({
			 	position: 0,
				fieldName: 'albumid',
				fieldValue: id,
				playlistAction: "replace",
				play: true
			}, nowplaying.update );
		});
		
		//albums pager button
		$('.op-more-albums').live('click', function(e){
			e.preventDefault();
			templates.pagerAction('.album-gallery-list', '.op-more-albums', xbmcapi.parsedsongs, templates.albumGalleryList, true );			
		});					
		
		
		
		//artists - nav
		$('.artist-list .artist-item .covers').live('click', function(){
			var id = $(this).parent().attr('data-artistid');
			xbmcmusic.getArtist(id);
		});	
		
		//artists pager button
		$('.op-more-artists').live('click', function(e){
			e.preventDefault();
			templates.pagerAction('.artist-list', '.op-more-artists', xbmcapi.allartists, templates.artistsList, true );			
		});
		
		
		
		//genres
		$('.genre-item .covers').live('click', function(){
			var id = $(this).parent().find('h4').html();
			xbmcmusic.getGenre(id);
		});	
		
		//genres pager button
		$('.op-more-genres').live('click', function(e){
			e.preventDefault();
			templates.pagerAction('.genre-list', '.op-more-genres', xbmcapi.allmusicgenres, templates.genreList, true );			
		});				
		
		
		//Generic Queue and music play based on parent id
		$('.action-queue-play').live('click', function(){
			var btn = $(this), 
				playtype = btn.attr('data-playtype'),
				id = btn.parent().attr('data-' + playtype );
				browserplayer.setPlayer('xbmc');
				xbmcapi.playMusic({
				 	position: 0,
					fieldName: playtype,
					fieldValue: id,
					playlistAction: "replace",
					play: true
				}, nowplaying.update );

		});
		
		
		
		
		
		//more structure below
		///////////////////////////////////
		
		
		
		
	    //bind button click actions
	    $('.xbmc-playlist-buttons a').live('click', function(e){
			  e.preventDefault();
			  
			  var o = $(this);
			  var task = o.attr('data-task');
			  var plid = 0;
	
			  var pl = playlists.getPlaylist(0);	
			  				  
			  if(task == 'op-pl-play-browser'){
				  
				  var items = [];
				  $(pl.i).each(function(i,s){
					  items.push({'file' : s.file});
				  });
				  
				  //make the playlist
				  var name = 'XBMC Mix', plid = playlists.hashCode(name);
				  var newpl = {id: plid, n: name, i: items};	
				  
				  //remove existing with that id
				  playlists.removePlaylist(plid);
				  
				  //add the files
				  playlists.activePlaylists.push(newpl);
				  
				  //save changes
				  playlists.getPlaylists();
				  
				  //change page
				  playlists.getPlaylistPage(plid);
				  browserplayer.setPlayer('browser');
				  
				  //start playing!
				  browserplayer.playInBrowser(plid, 0);
				  
				  mainapp.notify('start', 'Now playing in browser', 1);
			  }
			  if(task == 'op-pl-export'){
				  playlists.exportPlaylist(0);
			  }		
			  if(task == 'op-pl-clear'){
				  if(confirm("Are you sure?")){
					  xbmcapi.playlistClear( nowplaying.update );
					  xbmcmusic.getPlayingPage();
				  }
				  
			  }		  
	    });
		
		
		
		
		
		
		
		
	},
	
	
	//ability to hash a string
	hashCode: function(string){
	    var hash = 0;
	    if (string.length == 0) return hash;
	    for (i = 0; i < string.length; i++) {
	        char = string.charCodeAt(i);
	        hash = ((hash<<5)-hash)+char;
	        hash = hash & hash; // Convert to 32bit integer
	    }
	    return hash;
	}

	
};
