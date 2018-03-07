/*
 *
 * @author Annie Yin
 *
 */

var lists = [];
var users = [{name: 'annie', email: 'wy30', id: 0}, {name: 'juliana', email: 'jvz2', id: 1}];
var categories = [{name: 'urgent', color: 'red'}, {name: 'school', color: 'green'}];

var app = new Vue ({
    el: '#app',
    data: {
        listData: lists,
        userData: users,
        categoryData: categories,
        newCard: {name: '', description: '', deadline: '', id: null, dateCreated: '', images: [], todos: [], categories: []},
        newList: {name: '', cards: [], id: null},
        newUser: {name: '', email: '', image: '', id: null},
        newCategory: {name: '', color: ''}
    },
    
    methods: {
        addCard: function (event) {
            var self = this;
            var modal = $('#add-modal');
            modal.css('display', 'block');
            var list = event.target.parentElement.parentElement.getAttribute('id');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-card').off('click');
            $('#save-card').click(function () {
                modal.css('display', 'none');
                self.newCard.name = self.newCard.name.trim();
                self.newCard.id = self.listData[list].cards.length;
                var today = new Date();
                self.newCard.dateCreated = (today.getMonth()+1) + '/' + today.getDate() + '/' + today.getFullYear();
                if (self.newCard.name) {
                    self.listData[list].cards.push(self.newCard);
                }
                
                $('#add-modal').get(0).reset();
                $('.added-tasks').remove();
                self.newCard = {name: '', description: '', deadline: '', id: null, dateCreated: ''};
            });
        },
        
        addTask: function () {
            var self = this;
            self.newCard.todos.push($('#add-task').val());
            var newTask = $('<li class="added-tasks">' + $('#add-task').val() + '</li>');
            newTask.css('color', 'darkgray');
            newTask.css('margin-top', '5px');
            $('ul').append(newTask);
            $('#add-task').val('');
        },
    
        showCard: function () {
            var self = this;
            var modal = $('#show-modal');
            modal.css('display', 'block');
            var card = parseInt(event.currentTarget.getAttribute('id'));
            var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));

            $('.close').off('click');
            $('.close').click(function () {
                $('#show-checklist').empty();
                $('#show-created').empty();
                modal.css('display', 'none');
            });
            
            $('#show-name').text(self.listData[list].cards[card].name);
            $('#show-description').text(self.listData[list].cards[card].description);
            $('#show-checklist').append('<p style="color: darkgray; font-size: 17px; font-weight: bold; margin-bottom: 0;">Checklist: </p>');
            for (var i = 0; i < self.listData[list].cards[card].todos.length; i++) {
                var task = $('<div class="task-div"></div>');
                task.css('display', 'flex');
                task.css('flex-direction', 'row');
                task.css('align-items', 'baseline');
                task.css('margin', '0');
                task.append($('<input style="width: 10%;" type="checkbox">'));
                task.append($('<p style="margin-bottom: 0;">' + self.listData[list].cards[card].todos[i] + '</p>'));
                $('#show-checklist').append(task);
            }
            $('#show-deadline').text('Deadline: ' + self.listData[list].cards[card].deadline);
            $('#show-datecreated').text('Date Created: ' + self.listData[list].cards[card].dateCreated);
        },
        
        deleteCard: function (event) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            var self = this;
            var card = event.target.parentElement.parentElement.getAttribute('id');
            var list = event.target.parentElement.parentElement.parentElement.parentElement.getAttribute('id');
            
            self.listData[list].cards.splice(card, 1);
        },
        
        addList: function () {
            var self = this;     
            self.newList.name = self.newList.name.trim();
            self.newList.id = self.listData.length;
            if (self.newList.name) {
                self.listData.push(self.newList);
            }
            $('#list-input').val("");
            self.newList = {name: '', cards: [], id: null};
                
        },
        
        addUser: function () { 
            var self = this;
            var modal = $('#add-user-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-user').off('click');
            $('#save-user').click(function () {
                modal.css('display', 'none');
                self.newUser.name = self.newUser.name.trim();
                self.newUser.email = self.newUser.email.trim();
                self.newUser.id = self.userData.length;
                if (self.newUser.name && self.newUser.email) {
                    self.userData.push(self.newUser);
                }
                
                $('#add-user-modal').get(0).reset();
                self.newUser = {name: '', email: '', id: null};
            });
        },
        
        checkUser: function () {
            var self = this;
            var modal = $('#sign-in-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            var alreadyUser = false;
            
            $('#sign-in').off('click');
            $('#sign-in').click(function () {
                self.newUser.name = self.newUser.name.trim();
                self.newUser.email = self.newUser.email.trim();
                if (self.newUser.name && self.newUser.email) {
                    for (var i = 0; i < self.userData.length; i++) {
                        if (self.userData[i].name == self.newUser.name && self.userData[i].email == self.newUser.email) {
                            // TODO: add something to allow user to change their stuff
                            modal.css('display', 'none');
                            alreadyUser = true;
                            break;
                        }
                    }
                    
                    if (alreadyUser == false) {
                        var error = $('<p id="error">User not found. Please sign up!</p>');
                        error.css('text-align', 'center');
                        error.css('color', 'darkgray');
                        error.css('font-weight', 'bold');
                        $('#sign-in').replaceWith(error);
                        
                        $('.close').off('click');
                        $('.close').click(function () {
                            $('#error').replaceWith($('<p id="sign-in" class="save">Sign in</p>'))
                            modal.css('display', 'none');
                        });
                    }
                } 
                
                $('#sign-in-modal').get(0).reset();
                self.newUser = {name: '', email: '', id: null};
            });
        },
        
        deleteList: function (event) {
            var self = this;
            var list = event.target.parentElement.parentElement.getAttribute('id');
            console.log(list);
            self.listData.splice(list, 1);
        },
        
        editCardName: function (event) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            var self = this;
            var modal = $('#rename-modal');
            modal.css('display', 'block');
            var card = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            var list = parseInt(event.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute('id'));
            console.log(list);
            console.log(card);
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-name').off('click');
            $('#save-name').click(function () {
                modal.css('display', 'none');
                var newName = $('#new-name').val();
                self.listData[list].cards[card].name = newName;
                $('#rename-modal').get(0).reset();
            });
            
            /*$('#' + list.toString() + '.list').find($('#' + card.toString() + '.card')).find($('.card-text')).replaceWith($('<input id="new-card-name" >'));
            
            $('#new-card-name').off('click');
            $('#new-card-name').click(function () {
                if (!e) var e = window.event;
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
                
                $('#new-card-name').keypress(function(e) {
                    if (e.which == 13) {
                        var newName = $('#new-card-name').val();
                        self.listData[list].cards[card].name = newName;
                        $('#new-card-name').replaceWith('<p class="card-text" v-on:click="editCardName($event)">' + newName + '</p>');
                    }
                });
            });*/
            
        },
        
        editListName: function (event) {
            var self = this;
            var modal = $('#rename-modal');
            modal.css('display', 'block');
            var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-name').off('click');
            $('#save-name').click(function () {
                modal.css('display', 'none');
                var newName = $('#new-name').val();
                self.listData[list].name = newName;
                $('#rename-modal').get(0).reset();
            });
            
            
            /*$('#' + list.toString() + '.list').find($('h5')).replaceWith($('<input id="new-list-name" style="margin-left: 5%;">'));
            
            $('#new-list-name').off('click');
            $('#new-list-name').click(function () {
                if (!e) var e = window.event;
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
                
                $('#new-list-name').keypress(function(e) {
                    if (e.which == 13) {
                        var newName = $('#new-list-name').val();
                        self.listData[list].name = newName;
                        $('#new-list-name').replaceWith('<h5 v-on:click="editListName($event)">' + newName + '</h5>');
                    }
                });
            });*/
            
        }, 
        
        collapseList: function (event) {
            var self = this;
            var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            
            $('#' + list.toString() + '.list').find($('.yo')).css('display', 'none');
        },
        
        expandList: function (event) {
            var self = this;
            var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            
            $('#' + list.toString() + '.list').find($('.yo')).css('display', 'block');
        },
        
        chooseBackgroundColor: function () {
            $('body').css('background-color', $('#background-color').val());
        },
        
        // TODO: does not work
        chooseBackgroundImage: function () {
            console.log($('#background-image').val());
            // $('body').css('background-image', 'url("' + $('#background-image').val() + '")');
        },
        
        // TODO:
        filterByDate: function () {
            
        },
        
        // TODO: 
        filterByColor: function () {
            
        },
        
        addCategory: function () {
            var self = this;
            
            var modal = $('#category-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-category').off('click');
            $('#save-category').click(function () {
                modal.css('display', 'none');
                self.categoryData.push(self.newCategory);
                console.log(self.categoryData);
                $('#category-modal').get(0).reset();
                self.newCategory = {name: '', color: ''};
            });
            
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
