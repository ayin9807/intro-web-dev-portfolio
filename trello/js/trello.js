/*
 *
 * @author Annie Yin
 *
 */

var lists = [];

var app = new Vue ({
    el: '#app',
    data: {
        listData: lists,
        newCard: {name: '', description: '', deadline: ''},
        newList: {name: '', cards: []}
    },
    
    methods: {
        addCard: function () {
            var self = this;
            var modal = $('#add-modal');
            modal.css('display', 'block');
            
            $('#save-card').click(function () {
                self.newCard.name = self.newCard.name.trim();
                if (self.newCard.name) {
                    self.listData.push(self.newCard);
                }
                modal.css('display', 'none');
                $('input').val('');
                $("textarea").val('');
            })
            
            $('#add-close').click(function () {
                modal.css('display', 'none');
            })
        }, 
        
        showCard: function () {
            var self = this;
            var modal = $('#show-modal');
            modal.css('display', 'block');
            
            $('#show-close').click(function () {
                modal.css('display', 'none');
            })
        }
        
    },
    
    mounted: function () {
        var self = this;
        $.ajax({
            url: '../data.json',
            method: 'GET',
            success: function (data) {
                self.listData = data;
            }
        });
    }
});
