import Vue from 'Vue'

const style = {

}


let vm

export function init() {
    if(!vm) {

        const el = document.createElement('div')
        document.body.appendChild(el)

        vm = new Vue({
            el,
            render(h) {
                return (
                    <div id="-autopager">
                        <span> 选取内容: </span> <button> 添加 </button>
                        <div class="autopager-contents">
                            <div v-for="content in contents">
                                <input type="text" v-model="content"/> <button>+</button>
                            </div>
                        </div>
                        <div class="autopager-next">
                            <span> 下一页: </span>
                            <input type="text" v-model="next" /> <button>+</button>
                        </div>
                    </div>
                )
            },
            data() {
                return  {
                    style,
                    contents: [],
                    next: 'Hala',
                    selectMode: false
                }
            }
        })
    }
}