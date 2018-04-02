<template>
    <div id="QuestionInfo" style="background-color: info[quiz].style;">
        {{info[quiz].style}}
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
        <input type="button" value="Next" @click="nextQ"> 
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

#title {
    text-align: center;
    font-size: 24px;
}
    
template {
    display: flex;
    flex-direction: column;
}

</style>