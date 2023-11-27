import '../assets/css/teamboard.css'
import '../assets/css/login.css'

import { createTeam, joinTeam, getTeamInfo, generateIvCode, deleteTeam, removeMember, changeLeader } from '../api/api'

export default {
    target: 'main',
    methods: {
        showCreate: () => {
            document.getElementById('entrance').style.display = 'none'
            document.getElementById('create').style.display = 'block'
        },
        showJoin: () => {
            document.getElementById('entrance').style.display = 'none'
            document.getElementById('join').style.display = 'block'
        },
        hideCreate: () => {
            document.getElementById('create').style.display = 'none'
            document.getElementById('entrance').style.display = 'flex'
        },
        hideJoin: () => {
            document.getElementById('join').style.display = 'none'
            document.getElementById('entrance').style.display = 'flex'
        },
        createTeam: () => {
            const teamName = document.querySelector('[name="cteamname"]').value
            if (teamName === ''){
                window.alert('战队名不可为空！')
                document.querySelector('[name="cteamname"]+.alert').innerText = '*战队名不可为空！'
                return
            }
            else {
                document.querySelector('[name="cteamname"]+.alert').innerText = ''
                createTeam(teamName)
            }
        },
        joinTeam: () => {
            const teamName = document.querySelector('[name="jteamname"]').value
            const iCode = document.querySelector('[name="icode"]').value
            if (teamName === '' || iCode === ''){
                window.alert('战队名和邀请码不可为空！')
                return
            }
            joinTeam(teamName, iCode)
        },
        showTeamInfo: async () => {
            const result = await getTeamInfo()

            // 战队名和成员数
            document.querySelector('#team-name>p').innerText = result.name
            document.querySelector('#team-name b').innerText = `共${result.members.length}名成员`

            // 基本信息
            // document.querySelector('#team-name>p').innerText = result.ranking
            document.querySelector('#team-score p').innerText = result.points
            document.querySelector('#team-solved p').innerText = result.challenges_solved

            // 成员信息
            const infoZone = document.getElementById('infozone')
            result.members.forEach(item => {
                const template = `
                <div class="infobar">
                    <h1>${item.username}</h1>
                    <ul>
                        <li><span>id：&nbsp;</span><span>${item.id}<span></li>
                        <li><span>排名：&nbsp;</span><span>${item.ranking}<span></li>
                        <li><span>积分：&nbsp;</span><span>${item.points}<span></li>
                        <li><span>解题数：</span><span>${item.solved_challenges.length}</span></li>
                    </ul>
                </div>
                `
                infoZone.innerHTML += template
            })
            // 邀请码
        },
        generateIvCode: async () => {
            const code = await generateIvCode()
            if (code !== ''){
                document.getElementById('icode').innerText = '邀请码：' + code
            }
        },
        deleteTeam: () => {
            const flag = window.confirm('您确定要解散队伍吗？此操作会造成不可逆转的结果')
            if (flag){
                deleteTeam()
            }
        },
        removeMember: async () => {
            const id = window.prompt('请输入想要移除的用户id')
            if (id !== null && id !== ''){
                await removeMember(id)
            }
            else if(id === ''){
                window.alert('id不可为空！')
            }
        },
        changeLeader: async () => {
            const id = window.prompt('请输入想要移除的用户id')
            if (id !== null && id !== ''){
                await changeLeader(id)
            }
            else if(id === ''){
                window.alert('id不可为空！')
            }
        }

    },
    template: `
        <div id="teamboard">
            <div id="entrance" class="card">
                <b>您还没有战队(未加入或被移出战队)，您可以选择</b><a id="create-team">创建队伍</a><b>或</b><a id="join-team">加入战队</a>
            </div>
            <form id="create" class="card" style="display: none">
                <div class="forminput">
                    <label for="cteamname">战队名:</label>
                    <input type="text" placeholder="Team Name..." name="cteamname">
                    <div class="alert"></div>
                </div>
                <div class="ops">
                    <div class="button" id="cconfirm">确认</div>
                    <div class="button" id="ccancel">取消</div>
                </div>
            </form>
            <form id="join" class="card" style="display: none">
                <div class="forminput">
                    <label for="jteamname">战队名:</label>
                    <input type="text" placeholder="Team Name..." name="jteamname">
                    <div class="alert"></div>
                </div>
                <div class="forminput">
                    <label for="icode">邀请码:</label>
                    <input type="text" placeholder="Invitation Code..." name="icode">
                    <div class="alert"></div>
                </div>
                <div class="ops">
                    <div class="button" id="jconfirm">确认</div>
                    <div class="button" id="jcancel">取消</div>
                </div>
            </form>
            <div id="teaminfo" class="card" style="display: none">
                <div id="baseinfo">
                    <div id="team-name" class="item">
                        <p><p>
                        <b></b>
                    </div>
                    <div id="team-rank" class="item">
                        <b>排名</b>
                        <p>1</p>
                    </div>
                    <div id="team-score" class="item">
                        <b>积分</b>
                        <p></p> 
                    </div>
                    <div id="team-solved" class="item">
                        <b>题解数</b>
                        <p></p>
                    </div>
                </div>
                <div id="memberinfo">
                    <div id="title">成员信息</div>
                    <div id="infozone"></div>
                </div>
                <div id="icode"></div>
                <div id="leaderzone">
                    <div class="button" id="code">创建邀请码</div>
                    <div class="button" id="remove">移除成员</div>
                    <div class="button" id="change">队长转让</div>
                    <div class="button" id="dismiss">解散队伍</div>
                </div>
            </div>
        </div>
    `,
    afterMount: function() {
        const flag = JSON.parse(sessionStorage.getItem('zctf-userinfo')).team === null
        // 未有队伍视图
        if (flag){
            document.getElementById('create-team').addEventListener('click', this.methods.showCreate)
            document.getElementById('join-team').addEventListener('click', this.methods.showJoin)
            document.getElementById('ccancel').addEventListener('click', this.methods.hideCreate)
            document.getElementById('jcancel').addEventListener('click', this.methods.hideJoin)
            document.getElementById('cconfirm').addEventListener('click', this.methods.createTeam)
            document.getElementById('jconfirm').addEventListener('click', this.methods.joinTeam)
        }
        // 已有队伍视图
        else {
            document.getElementById('entrance').style.display = 'none'
            document.getElementById('teaminfo').style.display = 'flex'
            this.methods.showTeamInfo()
            // 判断是否是队长

            document.getElementById('code').addEventListener('click', this.methods.generateIvCode)
            document.getElementById('dismiss').addEventListener('click', this.methods.deleteTeam)
            document.getElementById('change').addEventListener('click', this.methods.changeLeader)
            document.getElementById('remove').addEventListener('click', this.methods.removeMember)
        }
    },
    destroyed: function() {
        const flag = JSON.parse(sessionStorage.getItem('zctf-userinfo')).team === null ? false:true
        // 未有队伍视图
        if (flag){
            document.getElementById('create-team').removeEventListener('click', this.methods.showCreate)
            document.getElementById('join-team').removeEventListener('click', this.methods.showJoin)
            document.getElementById('ccancel').removeEventListener('click', this.methods.hideCreate)
            document.getElementById('jcancel').removeEventListener('click', this.methods.hideJoin)
            document.getElementById('cconfirm').removeEventListener('click', this.methods.createTeam)
            document.getElementById('jconfirm').removeEventListener('click', this.methods.joinTeam)
        }
        // 已有队伍视图
        else {
            // 判断是否是队长

            document.getElementById('code').removeEventListener('click', this.methods.generateIvCode)
            document.getElementById('dismiss').removeEventListener('click', this.methods.deleteTeam)
            document.getElementById('change').removeEventListener('click', this.methods.changeLeader)
            document.getElementById('remove').removeEventListener('click', this.methods.removeMember)
        }
    }
}