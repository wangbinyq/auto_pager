import Vue from 'Vue'

const style = {

}


let vm

export function init() {
    if(!vm) {

        vm = new Vue({
            el: document.body,
            render(h) {
                return (
                    <div id="-autopager">
                        <div class="autopager-contents">
                            <div v-for="content in contents">
                            </div>
                        </div>
                        <div class="autopager-next">
                        </div>
                    </div>
                )
            },
            data: {
                style,
                contents: [],
                next: ''
            }
        })
    }
}