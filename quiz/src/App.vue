<!-- @author: Annie Yin -->

<template>
    <div id="app">
        <div id="frontpage" v-if="!quiztype">
            <h2 id="title">{{title}}</h2>
            <div id="options">
                <div class="choice" v-for="(key, value) in quizzes" v-bind:id="value" @click="displayQuiz(value)">
                    {{value}}
                </div>
            </div>
        </div>
        
        <question-info v-if="!!quiztype && unanswered.length != 0" :info="quizzes" :quiz="quiztype" :currentQ="current" :nextQ="displayNext" :onRadioChange="onRadioChange" :clear="clear"></question-info>
        
        <div id="scorepage" v-if="unanswered.length == 0">
            <h2>Your score is {{(score/5.0)*100}}%!</h2>
            <div id="restart" @click="restart">Restart?</div>
        </div>
    </div>
</template>

<script>

import QuestionInfo from './components/QuestionInfo.vue'
var content = require('./assets/quizzes.json')

export default {
    name: 'app',
    data () {
        return {
            title: 'Which quiz would you like to take?',
            quizzes: content,
            picked: null,
            current: 0,
            quiztype: null,
            score: 0,
            unanswered: [0, 1, 2, 3, 4],
            wrong: [],
            clear: null,
        }
    }, 
    
    components: {
        'question-info': QuestionInfo
    }, 
    
    methods: {
        displayQuiz (type) {
            this.quiztype = type
            // console.log(this.quiztype)
        },
        
        displayNext () {
            // if answer is picked
            var index = this.unanswered.indexOf(this.current)
            console.log(index)
            console.log(this.picked)
            if (this.picked != null) {
                if (this.quizzes[this.quiztype].info[this.current].correct == this.picked) {
                    this.score++
                }
                this.unanswered.splice(index, 1)
                if (this.unanswered.length != 0 && index < this.unanswered.length) {
                    this.current = this.unanswered[index]
                } else {
                    if (this.unanswered.length > 0) {
                        this.current = this.unanswered[0] 
                    } else {
                        // reset quiztype, unanswered array, and score
                        // this.quiztype = null
                        // this.unanswered = [0, 1, 2, 3, 4]
                        // this.score = 0
                    }
                }
            } else {       // if no answer is picked
                if (index+1 < this.unanswered.length) {
                    this.current = this.unanswered[index+1]
                } else {
                    this.current = this.unanswered[0]
                }
            }
            // console.log(this.score)
            console.log(this.unanswered)
            this.clear = null
            this.picked = null
        },
        
        onRadioChange (event) {
            this.picked = event.target.value
            console.log(this.clear)
        },
        
        restart () {
            this.quiztype = null
            this.unanswered = [0, 1, 2, 3, 4]
            this.score = 0
            this.current = 0
        }
    }
}
</script>

<style lang="scss">
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
    
    #title {
        font-size: 28px;
    }

#options {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    color: darksalmon;
    font-size: 26px;
    font-weight: bold;
    margin-top: 5%;
}

.choice {
    padding: 3%;
    border: solid 2px lightgray;
}
    
.choice:hover, #restart:hover {
    cursor: pointer;
}
    
#restart {
    border: solid 2px lightgray;
    width: 15%;
    padding: 2% 2%;
    font-weight: bold;
    margin: 0 auto;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
