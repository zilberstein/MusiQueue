$('#go').click(function(){
    var artist = $('#artist').val();

    var url = 'http://ws.spotify.com/search/1/track.json?q=artist:' + artist.toLowerCase().replace(/ /g, '+');
    $.ajax({
        url: url
    }).done( function(data){
        // alert(JSON.stringify(data));
        $('#responce').html(JSON.stringify(
            '<iframe src=\'https://embed.spotify.com/?uri=' + data.tracks[0].href + '\' width=\'300\' height=\'380\' frameborder=\'0\' allowtransparency=\'true\'></iframe>'
        ));
    });
});