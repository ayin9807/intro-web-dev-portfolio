/*
 * @author Annie Yin
 */

$(function() {
    
    var pictures = [];
    
    // get pictures from json using ajax
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: './data.json',
        
        success: function (result) {
            for (var i in result) {
                pictures.push(result[i]);
            }
            
            makeSlideshow (pictures);
            makeCheckboxes (pictures);
            addPics (pictures);
            makeModal ();
            getCheckboxInput ();
            implementModal ();
        }
    });
    
    function makeSlideshow (pictures) {
        
    }
    
    function makeCheckboxes (pictures) {
        // console.log(pictures);
        var categories = [];
        for (var i in pictures) {
            categories.push(pictures[i].category);
        }
        
        // get rid of duplicates
        var categorySet = new Set (categories);
        // categorySetadd('all');
        
        var j = 1;
        for (let item of categorySet) {
            var div = $('<div id=' + item + '/>');
            $('<input/>', {
                type: 'checkbox',
                id: item, 
                name: 'category'
            }).prop('checked', true).appendTo(div);
            div.appendTo('#checkbox');
            div.append(item);
            j += 1;
        }
        
        // modifying css for checkboxes
        $('#checkbox').css('display', 'inline-flex');
        $('#checkbox').css('justify-content', 'space-evenly');
        $('#checkbox').css('color', 'steelblue');
        $('#checkbox').css('width', '100%'); 
        $('#checkbox').css('margin-bottom', '2%'); 
    }
    
    function getCheckboxInput () {
        // var checked = [];
        $('input').click(function () {
            $('input').each(function () {
                var checked = $(this).prop('checked');
                var category = $(this).attr('id');
                $('figure').each(function () {
                    if ($(this).attr('class') == category) {
                        checked ? $(this).show() : $(this).hide();
                    }
                });
            });
        });
    }
    
    function addPics (pictures) {
        for (var i = 0; i < pictures.length; i++) {
            var picDiv = $('<figure class=' + pictures[i].category + '/>');
            var image = $('<img class="original" src=' + pictures[i].link + ' >');
            image.attr('alt', pictures[i].caption);
            picDiv.append(image);
            // picDiv.append('<img class="original" src=' + pictures[i].link + 'alt=' + pictures[i].caption + ' >');
            // var caption = $('<div id=caption>' + pictures[i].caption + '</div>');
            // caption.css('display', 'none');
            // picDiv.append(caption);
            $('#gallery').append(picDiv);
        }
        
        $('.original').css('width', '350px');
        $('.original').css('max-width', '100%');
        $('.original').css('max-height', '450px');
        $('.original').hover(function () {
            $(this).css('opacity', '0.8');
            }, function () {
            $(this).css('opacity', '1');
        });
        $('#gallery').css('display', 'inline-flex');
        $('#gallery').css('flex-wrap', 'wrap');
        $('#gallery').css('justify-content', 'center');
        $('#gallery').css('align-content', 'space-around');
        $('figure').css('text-align', 'center');
    }
    
    function makeModal () {
        var modal = $('<div class="modal"/>');
        modal.append($('<span class="close">&times;</span>'));
        modal.append($('<img id="modal-image">'));
        modal.append($('<div id="caption"/>'));
        $('body').append(modal);
        
        $('.modal').css('display', 'none');
        $('.modal').css('position', 'fixed');
        $('.modal').css('z-index', '1');
        $('.modal').css('padding-top', '100px');
        $('.modal').css('left', '0');
        $('.modal').css('top', '0');
        $('.modal').css('overflow', 'auto');
        $('.modal').css('width', '100%');
        $('.modal').css('height', '100%');
        $('.modal').css('background-color', 'rgba(128, 128, 128, 0.9)');
        
        $('#modal-image').css('margin', 'auto');
        $('#modal-image').css('display', 'block');
        // $('#modal-image').css('width', '70%');
        $('#modal-image').css('max-width', '700px');
        
        $('#caption').css('margin', 'auto');
        $('#caption').css('padding-top', '1%');
        $('#caption').css('display', 'block');
        $('#caption').css('text-align', 'center');
        $('#caption').css('color', 'white');
        
        $('.close').css('position', 'absolute');
        $('.close').css('top', '4%');
        $('.close').css('right', '6%');
        $('.close').css('color', 'white');
        $('.close').css('font-size', '40px');
    }
    
    function implementModal () {
        var modal = $('.modal');
        var image = $('.original');
        var modalImage = $('#modal-image');
        var caption = $('#caption');
        
        image.click(function () {
            modal.css('display', 'block');
            modalImage.attr('src', $(this).attr('src'));
            caption.text($(this).attr('alt'));
        });
        
        var span = $('.close');
        
        span.hover(function () {
            $(this).css('cursor', 'pointer');
            }, function () {
            $(this).css('cursor', 'auto');
        });
        
        span.click(function () {
            modal.css('display', 'none');
        });
        
        /*$('.figure').each(function () {
            var image = $('.original');
            var modalImage = $('.modal-image');
            image.click(function () {
                modal.css('display', 'block');
                modalImage.src = this.src;
            });
            
            var span = $('.close')[0];
            span.click(function () {
                modal.css('display', 'none');
            });
        });*/
    }
    
});