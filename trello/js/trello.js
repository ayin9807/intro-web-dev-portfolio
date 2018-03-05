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
        newList: {name: '', cards: [], id: null}
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
            });
            
            $('#save-card').off('click');
            $('#save-card').click(function () {
                modal.css('display', 'none');
                self.newCard.name = self.newCard.name.trim();
                self.newCard.id = self.listData[list].cards.length;
                if (self.newCard.name) {
                    self.listData[list].cards.push(self.newCard);
                }
                
                $('#add-modal').get(0).reset();
                self.newCard = {name: '', description: '', deadline: '', id: null};
            });
        }, 
        
        showCard: function (event) {
            var self = this;
            var modal = $('#show-modal');
            modal.css('display', 'block');
            var card = parseInt(event.currentTarget.getAttribute('id'));
            var list = parseInt(event.currentTarget.parentElement.getAttribute('id'));
        
            console.log(card);
            console.log(list);
            
            $('#show-close').off('click');
            $('#show-close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#show-name').text(self.listData[list].cards[card].name);
            $('#show-description').text(self.listData[list].cards[card].description);
            $('#show-deadline').text(self.listData[list].cards[card].deadline);
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
            var self = this;
            var listInput = $('<input id="list-input" v-model="newList.name" v-on:keyup.enter="submitList"/>');
            listInput.css('margin-top', '2.5%');
            listInput.css('margin-left', '2%');
            listInput.css('height', '20%');
            $('#add-list').replaceWith(listInput);
            
            /*$('#list-input').on("keydown", function(e) {
                if (e.keyCode == 13) {
                    console.log(self.newList.name);
                    self.newList.name = self.newList.name.trim();
                    self.newList.id = self.listData.length;
                    if (self.newList.name) {
                        self.listData.push(self.newList);
                    }

                    $('#listInput').replaceWith(addList);
                    self.newList = {name: '', cards: [], id: null};
                    return false;
                }
            });*/
        },
        
        submitList: function () {
            var self = this;
            var addButton = $('#add-list');
            addButton.append('<i class="fa fa-plus-circle"></i><h5 v-on:click="addList">Add list</h5>');
            
            console.log(self.newList.name);
        },
        
        deleteList: function () {
            
        },
        
        addUser: function () {
            
        }
    },
    
    mounted: function () {
        var self = this;
        $.ajax({
            url: '/assignments-portfolio-ayin9807/trello/data.json',
            method: 'GET',
            success: function (data) {
                self.listData = data;
            }
        });
    }
});
