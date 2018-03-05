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
        newCard: {name: '', description: '', deadline: '', id: null},
        newList: {name: '', cards: []}
    },
    
    methods: {
        addCard: function (event) {
            var self = this;
            var modal = $('#add-modal');
            modal.css('display', 'block');
            var list = event.target.parentElement.getAttribute('id');
            console.log(list);
            
            $('#add-close').off('click');
            $('#add-close').click(function () {
                modal.css('display', 'none');
            })
            
            $('#save-card').off('click');
            $('#save-card').click(function () {
                modal.css('display', 'none');
                self.newCard.name = self.newCard.name.trim();
                self.newCard.id = self.listData[list].cards.length;
                console.log(self.newCard);
                if (self.newCard.name) {
                    self.listData[list].cards.push(self.newCard);
                }
                
                $('#add-modal').get(0).reset();
                self.newCard = {name: '', description: '', deadline: '', id: null};
            })
            
            console.log(self.listData);
            
        }, 
        
        showCard: function (event) {
            var self = this;
            var modal = $('#show-modal');
            modal.css('display', 'block');
            var card = event.target.getAttribute('id');
            var list = event.target.parentElement.getAttribute('id');
            console.log(card);
            console.log(list);
            
            $('#show-name').text(self.listData[list].cards[card].name);
            $('#show-description').text(self.listData[list].cards[card].description);
            $('#show-deadline').text(self.listData[list].cards[card].deadline);
            
            $('#show-close').click(function () {
                modal.css('display', 'none');
            })
        },
        
        deleteCard: function (event) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            var self = this;
            var card = event.target.parentElement.parentElement.getAttribute('id');
            var list = event.target.parentElement.parentElement.parentElement.getAttribute('id');
            
            self.listData[list].cards.splice(card, 1);
            console.log(self.listData);
        },
        
        addList: function () {
            
        },
        
        deleteList: function () {
            
        },
        
        addUser: function () {
            
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
