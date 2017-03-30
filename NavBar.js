$( function() {
    var show = 1;
    $("#slider-range").slider({
        range: true,
        min: 2015,
        max: 2020,
        step: 1,
        values: [2015, 2020],
        slide: function( event, ui ) {
            if(ui.values[ 0 ] === ui.values[ 1 ]){
                $("#start_project").text(ui.values[0]);
            }else {
                $("#start_project").text(ui.values[0] + " - " + ui.values[1]);
            }
            $('#start_project').trigger('contentchanged');
        }
    });

    $('#slider-range').slider().slider('pips');

    $('.ui-slider-handle').css('background-color', 'white');
    $('.ui-slider-handle').css('border-radius', '1px');
    $('.ui-slider-handle').css('height', '18px');
    $('.ui-slider-handle').css('width', '8px');
    $('.ui-slider-handle').css('box-shadow', '0 1px 2px 0 rgba(0,0,0,0.5);');
    $('.ui-slider-handle').css('margin-top', '-4.5px');
    $('.ui-slider-handle').css('margin-left', '-3px');

    $('.glyphicon-menu-left').on('click',function(){
        $('.side-menu').hide();
        $('.main-menu').hide();
        $('.glyphicon-menu-left').hide();
        $('.menu-list').show();
        $('.menu-list').css('top', '100px');
    });

    $('.glyphicon-list').on('click',function(){
        $('.menu-list').hide();
        $('.main-menu').show();
        $('.glyphicon-menu-left').show();
    });

    $(document).on('click','.glyphicon-remove-circle',function(){
        var id = $(this).attr('id');
        $(this).parent().remove();
        ($('#' + id).removeAttr('disabled'));
    });

    $('.side-menu button').on('click',function(){
        if($(this).css('background-color') === 'rgb(255, 255, 255)') {
            $(this).css('background-color', '#4A4A4A');
            $(this).css('color', 'white');
            var id = $(this).parent().attr('id');
            id = id.substr(0, id.indexOf('-'));
            id = id + '-result';
            var content = $(this).text();
            var li_id = content.replace('.','_');
            var li_id = li_id.replace('/','_');
            var li_id = li_id.replace(/ /g,'_');
            $('#' + id).append('<tag id="' + li_id +'">' + content +'</tag>');
        }
        else{
            $(this).css('background-color', 'white');
            $(this).css('color', 'black');
            var content = $(this).text();
            var li_id = content.replace('.','_');
            var li_id = li_id.replace('/','_');
            var li_id = li_id.replace(/ /g,'_');
            $('#' + li_id).remove();
        }
    });

    $('#disciplines').on('click',function(){
        if($('#disciplines-submenu').is(':visible')){
            $('[id$=-arrow]').removeClass('glyphicon-menu-up');
            $('[id$=-arrow]').addClass('glyphicon-menu-down');
            $('#disciplines-submenu').hide();
        }else{
            $('[id$=-arrow]').removeClass('glyphicon-menu-up');
            $('[id$=-arrow]').addClass('glyphicon-menu-down');
            $('.side-menu').hide();
            $('#disciplines-arrow').removeClass('glyphicon-menu-down');
            $('#disciplines-arrow').addClass('glyphicon-menu-up');
            $('#disciplines-submenu').show();
        }
    });

    $('#fcl_project').on('click',function(){
        if($('#fcl_project-submenu').is(':visible')){
            $('[id$=-arrow]').removeClass('glyphicon-menu-up');
            $('[id$=-arrow]').addClass('glyphicon-menu-down');
            $('#fcl_project-submenu').hide();
        }else{
            $('[id$=-arrow]').removeClass('glyphicon-menu-up');
            $('[id$=-arrow]').addClass('glyphicon-menu-down');
            $('.side-menu').hide();
            $('#fcl_project-arrow').removeClass('glyphicon-menu-down');
            $('#fcl_project-arrow').addClass('glyphicon-menu-up');
            $('#fcl_project-submenu').show();
        }
    });

    $('#location').on('click',function(){
        if($('#location-submenu').is(':visible')){
            $('[id$=-arrow]').removeClass('glyphicon-menu-up');
            $('[id$=-arrow]').addClass('glyphicon-menu-down');
            $('#location-submenu').hide();
        }else{
            $('[id$=-arrow]').removeClass('glyphicon-menu-up');
            $('[id$=-arrow]').addClass('glyphicon-menu-down');
            $('.side-menu').hide();
            $('#location-arrow').removeClass('glyphicon-menu-down');
            $('#location-arrow').addClass('glyphicon-menu-up');
            $('#location-submenu').show();
        }
    });

    $('#language').on('click',function(){
        if($('#language-submenu').is(':visible')){
            $('[id$=-arrow]').removeClass('glyphicon-menu-up');
            $('[id$=-arrow]').addClass('glyphicon-menu-down');
            $('#language-submenu').hide();
        }else{
            $('[id$=-arrow]').removeClass('glyphicon-menu-up');
            $('[id$=-arrow]').addClass('glyphicon-menu-down');
            $('.side-menu').hide();
            $('#language-arrow').removeClass('glyphicon-menu-down');
            $('#language-arrow').addClass('glyphicon-menu-up');
            $('#language-submenu').show();
        }
    });
});
