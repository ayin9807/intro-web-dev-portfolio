/*
 *
 * @author Annie Yin
 *
 */

/*var cardsData = [
    {
        name: 'Analytics Data',
        description: 'Creating monthly marketing report showcasing campaign info and marketing data.', 
        deadline: '3/5/17'
    },
    
    {
        name: 'Website Redesign',
        description: 'Our brand & product have evolved over the past two years, and our website should be updated to reflect this. The new site will be mobile-first, responsive and lightweight.',
        deadline: '3/17/17'
    }
]*/

var app = new Vue ({
    el: '#app',
    data: {
        lists: null
    },
    
    mounted: function () {
        $.ajax({
            url: '../data.json',
            method: 'GET',
            success: function (data) {
                this.lists = data;
                console.log(this.lists);
            }
        });
    }
});

/*var app = new Vue({
    el: '#app',
    data: {
        message: "Hi"
    }
})*/