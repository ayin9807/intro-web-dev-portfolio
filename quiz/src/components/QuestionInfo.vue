<template>
    <div id="question-info" v-bind:style="{'border-color': info[quiz].style}">
        <div id="title">Question {{currentQ+1}}</div>
        <div id="info">
            <div id="question">
                {{info[quiz].info[currentQ].question}}</div>
            <div id="all-answers">
                <div v-for="answer in info[quiz].info[currentQ].answers">
                    <input type="radio" name="answers" class="answer" v-bind:value="answer" v-on:change="onRadioChange" v-model="clear">
                    <label>{{answer}}</label>
                </div>
            </div>
        </div>
        <input class="button" type="button" value="Previously Missed">
        <input class="button" type="button" value="Next" @click="nextQ"> 
    </div>
</template>

<script>
    export default {
        name: 'QuestionInfo', 
        props: [
            'info',
            'quiz',
            'currentQ',
            'nextQ',
            'onRadioChange',
            'clear'
        ]
    }
</script>

<style lang="scss" scoped>
    
#question-info {
    border-style: solid;
    border-width: thick;
    width: 70%;
    margin: 0 auto;
}

#title {
    text-align: center;
    font-size: 24px;
    margin: 2% auto;
}
    
#question {
    margin: 1% auto;
}
    
.button {
    margin: 2% auto;
}
    
template {
    display: flex;
    flex-direction: column;
}

</style>