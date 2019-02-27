var log = console.log.bind(console)

var e = function(selector) {
    var element = document.querySelector(selector)
    return element
}

var es = function(selector) {
    var elements = document.querySelectorAll(selector)
    if (elements.length == 0) {
        var s = `元素没找到，选择器 ${selector} 没有找到或者 js 没有放在 body 里`
        alert(s)
    } else {
        return elements
    }
}
// 显示播放时间和实现播放进度联动
var showCurrentTime = function(a) {
    setInterval(function() {
        var cur = e('#cur')
        var dur = e('#dur')
        var current =  getTime(Math.floor(a.currentTime))
        var duration = getTime(Math.floor(a.duration))
        var s1 = `${current}`
        var s2 = `${duration}`
        cur.innerHTML = s1
        dur.innerHTML = s2
        var point = e('#point')
        var line = e('#line')
        var cur = Math.floor(a.currentTime)
        var dur = Math.floor(a.duration)
        var n = cur / dur
        var x = Math.floor(n * (line.offsetWidth))
        point.style.left = x + 'px'
    }, 1000)
}
//返回00:00的时间格式
var getTime = function(time) {
    var time = parseInt(time)
    var hour = addzero(Math.floor(time / 3600))
    var minute = addzero(Math.floor(time % 360 / 60))
    var second = addzero(Math.floor(time % 60))
    return minute + ':' + second
}
// 补零
var addzero = function(time) {
    if(time < 10){
        return '0' + time
    }else{
        return time + ''
    }
}
//调整播放进度
var controlPlay = function(a) {
    var obj = e('#point')
    var lineC = e('#line')
    obj.onmousedown =  function(event) {
        // event = event || window.event
        // event.preventDefault()
        var oLineleft = event.clientX - obj.offsetLeft
        document.onmousemove = function(event) {
            // event = event || window.event
            // event.preventDefault()
            var xC = event.clientX
            var x = xC - oLineleft
            if (x < 0) {
                x = 0
            } else if (x < lineC.offsetWidth) {
                x = xC - oLineleft
            } else if (x >= lineC.offsetWidth) {
                x = lineC.offsetWidth
            }
            obj.style.left = x + 'px'
            var num = x / (lineC.offsetWidth - obj.offsetWidth)
            a.currentTime = num * a.duration
        }
        document.onmouseup = function() {
            document.onmousemove = null
            document.onmouseup = null
        }
    }
}
// 歌词拖动
var drag = function(a) {
    var lists = e('#lists')
    var oLi = lists.getElementsByTagName("li")
    !function changeAlign() {	//+function !function === (function(){})()
        var start
        for (var i = 0; i < oLi.length; i++) {
            oLi[i].index = i
            oLi[i].ondragstart = function() {
                start = this.index
                console.log("start:" + start)
            }
            oLi[i].ondragover = function(ev) {
                var ev = ev || window.event
                ev.preventDefault()
                // console.log(this.index);
                for (var i = 0; i < oLi.length; i++) {
                    this.style.border = "none"
                }
                if(this.index != start){
                    this.style.borderBottom = "1px solid #f00"
                }
            }
            oLi[i].ondrop = function(ev) {
                var ev = ev || window.event
                event.preventDefault()
                console.log("ondrop:"+this.index)
                var newArr = arrCopy(songDate);
                if (this.index === oLi.length) {	//最后添加
                    appendAfter(oLi[start],this)
                    songDate.splice(start,1)
                    songDate.splice(this.index, 0, newArr[start])

                } else if (this.index == 0) {		//最前添加

                } else if (start > this.index) {

                }
                this.style.border = "none"
                changeAlign()
            }
        }
    }()
    // 复制数组
    function arrCopy(arr) {
        var newArr = ''
        for (var i = 0; i < arr.length; i++) {
            newArr[i] = arr[i]
        }
        return newArr;
    }
    // 在obj后面添加元素
    function appendAfter(newNode,targetNode) {
        var oP = targetNode.parentNode
        if(oP.lastChild == targetNode){
            oP.appendChild(newNode)
        }else{
            oP.insertBefore(newNode,targetNode.nextSibling)
        }
    }
}
// 点击播放方式
var toggle = function(a) {
    var oWay = e('#way')
    var hid = e('#hid')
    var off = {
        f: 0
    }
    oWay.addEventListener('click', function(evrnt) {
        if (off.f){
            hid.style.display = "none"
            off.f = 0
        } else {
            hid.style.display = "block"
            off.f = 1
        }
    })
}
//选择播放方式
var autoPlay = function(a, songs, songDate, off) {
    var point = e('#point')
    var cur = e('#cur')
    var dur = e('#dur')
    a.addEventListener('ended', function() {
        clearInterval(a.timer)
        point.style.left = "0px"
        cur.innerHTML = "00:00"
        dur.innerHTML = "00:00"
        // 判断下一曲播放方式
        var index = off.n
        switch(index) {
            //顺序播放
            case 0:
                var index = Number(a.dataset.index)
                if (index === songs.length - 1) {
                    var nextIndex = 0
                } else {
                    var nextIndex = (index + 1) % songs.length
                }
                a.dataset.index = nextIndex
                a.src = songs[nextIndex]
                showCurrentTime(a)
                changeText(a, songDate)
                a.play()
                break
            //随机播放
            case 1:
                var length = songs.length
                var index1 = Math.floor(Math.random() * length)
                var index = Number(a.dataset.index)
                var randomIndex = Number(index + index1) % length
                a.dataset.index = randomIndex
                a.src = songs[randomIndex]
                showCurrentTime(a)
                changeText(a, songDate)
                a.play()
                break
            //单曲播放
            case 2:
                var index = Number(a.dataset.index)
                a.src = songs[index]
                a.dataset.index = index
                changeText(a, songDate)
                a.play()
                break
        }
    })
}
// 返回播放方式
var playWay = function(off) {
    var oWay = e('#way')
    var hid = e('#hid')
    var hidList = hid.children
    for (var i = 0; i < hidList.length; i++) {
        hidList[i].index = i
        hidList[i].onclick = function() {
            oWay.innerHTML = this.innerHTML
            off.n = this.index
            hid.style.display = "none"
        }
    }
    return off.n
}
// 播放上一首
var bindEventFirst = function(a, songs, songDate) {
    var container = e('#id-button-first')
    container.addEventListener('click', function(event) {
        var index = Number(a.dataset.index)
        var first = (songs.length + index - 1) % songs.length
        a.dataset.index = first
        a.src = songs[first]
        a.addEventListener('canplay', a.play())
        showCurrentTime(a)
        changeText(a, songDate)
    })
}
// 播放下一首
var bindEventLast = function(a, songs, songDate) {
    var container = e('#id-button-next')
    container.addEventListener('click', function(event) {
        var index = Number(a.dataset.index)
        if (index === songs.length - 1) {
            var last = 0
        } else {
            var last = (index + 1) % songs.length
        }
        a.dataset.index = last
        a.src = songs[last]
        a.addEventListener('canplay', a.play())
        showCurrentTime(a)
        changeText(a, songDate)
    })
}
// 点击列表播放
var clicksong = function(a, songDate) {
    var point = e('#point')
    var playlist = es('#id-div-music')
    for (var i = 0; i < playlist.length; i++) {
        playlist[i].addEventListener('click', function(event) {
            var self = event.target
            var index = Number(self.dataset.index)
            a.dataset.index = index
            a.src = self.dataset.path
            a.addEventListener('canplay', a.play())
            point.style.left = "0px"
            showCurrentTime(a)
            changeText(a, songDate)
        })
    }

}
// 暂停、播放
var playEventpauseAndplay = function(a) {
    var b = e('#play')
    var off = {
        s: 1
    }
    b.addEventListener('click', function(event){
        event = event || window.event
        event.preventDefault()
        if (off.s === 1) {
            b.style.backgroundPosition = "-85px -54px"
            a.pause()
            off.s = 0
            // clearInterval(This.mp3.timer)
        } else {
            b.style.backgroundPosition = "-151px -53px"
            showCurrentTime(a)
            a.play()
            off.s = 1
        }

    })
}
// 显示歌词并完成滚动
var changeText = function(a, songDate) {
    var index =  Number(a.dataset.index)
    var song = e('#song')
    var singer = e('#singer')
    song.innerHTML = songDate[index].song
    singer.innerHTML = songDate[index].singer
    var g = songDate[index].txt.split('[')
    var str = ''
    for (var i = 0; i < g.length; i++) {
        var arr = g[i].split(']')
        var tArr = arr[0].split('.')
        var t = tArr[0].split(':')
        var time = t[0] * 60 + parseInt(t[1])
        var gc = arr[1]
        if (gc) {
            str += '<p id="s'+ time +'">'+ gc +'</p>'
        }
    }
    var show = e('#show')
    show.innerHTML = str
    // 歌词联动
    var oP = show.getElementsByTagName('p')
    //timeupdate  当歌曲时间发生变化时  触发后面功能
    a.addEventListener("timeupdate", function() {
        var time = parseInt(this.currentTime) 	//获取当前播放时间
        if (document.getElementById("s" + time)) {
            // 歌词添加
            for (var i = 0; i < oP.length; i++) {
                oP[i].style.color = 'rgb(162, 153, 153)'
                if (oP[i].id == 's' + time) {
                    oP[i].style.color = 'rgb(16, 16, 16)'
                }
            }
            // 歌词滚动
            for (var i = 0; i < time; i++) {
                show.style.marginTop = -(time * 2) + 'px'
            }
        }
    })
}
// 控制音量
var controlSound = function(a) {
    var tar = e('#spoint')
    var lineC = e('#sline')
    var off = {
        vol: 1
    }
    tar.onmousedown = function(ev) {
        ev = ev || window.event
        ev.preventDefault()
        var sLineleft = ev.clientX - tar.offsetLeft
        document.onmousemove = function(ev) {
            ev = ev || window.event
            ev.preventDefault()
            var xC = ev.clientX
            var x = xC - sLineleft
            if (x < 0) {
                x = 0
            } else if (x < lineC.offsetWidth){
                x = xC - sLineleft
            } else if (x >= lineC.offsetWidth){
                x = lineC.offsetWidth
            }
            tar.style.left = x + 'px'
            var num = x / lineC.offsetWidth
            a.volume = num
            off.vol = num
        }
        document.onmouseup = function() {
            document.onmousemove = null
            document.onmouseup = null
        }
    }
}
//静音播放
var muted = function(a) {
    var spoint = e('#spoint')
    var sline = e('#sline')
    var smuted = e('#muted')
    var off = {
        p: 1,
        vol: 1
    }
    smuted.onclick = function() {
        var left = spoint.offsetLeft
        if (off.p) {
            smuted.style.backgroundPosition = "-249px -5px"
            a.muted = true
            spoint.style.left = '0px'
            off.p = 0
        } else {
            smuted.style.backgroundPosition = "-218px -5px"
            a.muted = false
            spoint.style.left = off.vol * sline.offsetWidth + 'px'	//恢复到原来值
            off.p = 1
        }
    }
}
//实现播放时图片旋转
var rotate = function(a) {
    var rotateImage = e('.bj')
    var offAndOn = e('#play')
    var className = 'active-rotate'
    var off = {
        r: 1
    }
    offAndOn.addEventListener('click', function() {
        if (!off.r) {
            rotateImage.classList.add(className)
            off.r = 1
        } else {
            rotateImage.classList.remove(className)
            off.r = 0
        }
    })
}

var bindEvents = function() {
    var songs = [
        'mp3/徐佳莹 - 寻人启事.mp3',
        'mp3/徐佳莹 - 大头仔.mp3',
        'mp3/徐佳莹 - 高空弹跳.mp3',
        'mp3/徐佳莹 - 极限.mp3',
        'mp3/徐佳莹 - 失落沙洲.mp3',
    ]

    var songDate = [
        {
            song: '寻人启事',
            singer: '徐佳莹',
            mp3Src: 'mp3/徐佳莹 - 寻人启事.mp3',
            txt: '[00:00.00]寻人启事[00:02.07]词：Hush 曲：黄建为[00:03.71]唱：徐佳莹[00:07.93]歌词编辑：宅萱[00:14.04]让我看看 你的照片[00:17.44]究竟为什么 你消失不见[00:27.04]多数时间 你在哪边[00:30.58]会不会疲倦 你思念着谁[00:39.39]而世界的粗糙[00:42.96]让我去到你身边 难一些[00:52.39]而缘分的细腻[00:55.56]又清楚地浮现 你的脸[01:06.88]有些时候我也疲倦[01:10.16]停止了思念 却不肯松懈[01:19.84]就算世界 挡在我前面[01:23.14]猖狂地说 别再奢侈浪费[01:32.25]我多想找到你 轻捧你的脸[01:45.48]我会张开我双手 抚摸你的背[01:58.61]请让我拥有你 失去的时间[02:11.67]在你流泪之前 保管你的泪[02:38.00]而世界的粗糙[02:40.86]让我去到你身边 难一些[02:50.78]而缘分的细腻[02:54.26]又清楚地浮现 你的脸[03:04.36]我多想找到你 轻捧你的脸[03:17.53]我会张开我双手 抚摸你的背[03:30.64]请让我拥有你 失去的时间[03:43.46]在你流泪之前 保管你的泪[04:01.28]有些时候我也疲倦[04:04.51]停止了思念 却不肯松懈[04:14.21]就算世界 挡在我前面[04:17.54]猖狂地说 别再奢侈浪费'
        },
        {
            song: '大头仔',
            singer: '徐佳莹',
            mp3Src: 'mp3/徐佳莹 - 大头仔.mp3',
            txt: '[00:00.10]大头仔 - 徐佳莹[00:00.30]词：徐佳莹[00:00.40]曲：徐佳莹[00:00.50]编曲：徐佳莹/陈君豪[00:00.79]不曾那么有把握[00:03.42][00:03.96]再来一次还要闯这美丽的祸[00:07.85]任天空被你霸道的哭声划破[00:11.34][00:14.39]不啰嗦[00:15.28][00:15.90]下好离手[00:17.12][00:17.67]最后一次抱怨生活的苦然后[00:21.12][00:21.72]得准备够多快乐让你挥霍[00:24.75][00:28.59]世界再大再烂也轮不到你害怕[00:34.44]在一起是最壮胆的方法[00:39.66][00:41.52]哦亲爱的大头仔[00:46.97]看你经过的左边右边上面下面[00:51.57]全都被爱消毒一遍[00:55.01]哦亲爱的大头仔[01:00.63]有你搅和的昨天今天好的坏的[01:05.25]全都可以打包纪念[01:07.83][01:09.26]哪里来的骆驼客又珍贵又讨厌[01:12.45]百般伺候还要舍得看你摔跤泪满面[01:15.49][01:16.00]哪里来的迷你 me 教我砍掉重练[01:18.93][01:23.23]不曾那么有把握[01:25.68][01:26.31]再来一次还要闯这美丽的祸[01:30.05]任天空被你霸道的哭声划破[01:33.40][01:36.57]不啰嗦[01:37.61][01:38.20]下好离手[01:39.27][01:39.85]最后一次抱怨生活的苦然后[01:43.85]得准备够多快乐让你挥霍[01:46.88][01:50.96]人生再矛盾再累也轮不到我挣扎[01:56.20][01:56.71]你熟睡的脸总是能解答[02:01.69][02:03.73]哦亲爱的大头仔[02:09.33]看你经过的左边右边上面下面[02:13.77]全都被爱消毒一遍[02:16.33][02:17.54]哦亲爱的大头仔[02:22.87]有你搅和的昨天今天好的坏的[02:27.43]倒霉恩典柴米油盐[02:29.32]全都可以打包纪念[02:33.91][02:58.63]哦亲爱的大头仔[03:03.19][03:04.19]你可知你的妈妈爸爸阿公阿妈[03:08.72]已经等你很久很久[03:11.49]哦亲爱的大头仔[03:17.79]看你经过的左边右边上面下面[03:22.38]全都被爱消毒一遍[03:25.36]哦亲爱的大头仔[03:31.26]有你搅和的昨天今天好的坏的[03:36.09]倒霉恩典柴米油盐[03:37.91]全都可以打包纪念'
        },
        {
            song: '高空弹跳',
            singer: '徐佳莹',
            mp3Src: 'mp3/徐佳莹 - 高空弹跳.mp3',
            txt: '[00:01.00]高空弹跳[00:06.00]演唱：徐佳莹[00:09.00]作词：徐佳莹[00:12.00]作曲：徐佳莹[00:15.00][00:18.00]歌词编辑：◎天☆猫◎[00:21.00]QQ：228846602[00:25.00][00:28.08]我快听不到心的声音[00:34.50]要怎么顾及你的通缉[00:41.06]酸蚀的大雨越下就越警醒[00:46.75]说得笃定 其实那不是最好的语气[00:53.22][00:54.78]我快看不到该往哪去[01:00.56]要怎么忽视你的嫌弃[01:07.45]笑得越猖狂越是提醒[01:12.17]应该反省 最亲爱的[01:14.71]对不起又伤了你的心[01:20.19][01:21.29]构不到想要的[01:24.54]只能保持安静[01:28.71]不小心就沉默 过了头[01:34.58]快找不到我是谁[01:41.78]每次自我介绍[01:44.32]都像在心上轻轻划一刀[01:49.24]看不出来这该是谁[01:53.35][01:56.03]曝光或黑暗的都在别的次元[02:00.53]我没有感觉[02:02.98][02:15.69]我快听不到心的声音[02:22.47]要怎么顾及你的顾及[02:31.48]腐蚀的自己越给就越不值得珍惜[02:36.56]亲爱的你[02:38.29]对不起 又要说 对不起[02:43.13][02:44.29]构不到想要的[02:47.35]只能保持安静[02:51.82]不小心就沉默 过了头[02:58.25]快找不到我是谁[03:03.58]每次自我介绍[03:07.06]都像在心上轻轻划一刀[03:12.00]看不出来这该是谁[03:16.21][03:18.80]曝光或黑暗的都在别的次元[03:23.62]我没有感觉[03:25.52]一边系着灵魂再疯不敌风霜雨落[03:28.22]一边系着身体再乐不敌勒戒幸运的瘾头[03:32.25]一个得意忘形造就一只史前怪兽[03:34.93]缩 收 拉扯够没有[03:38.44]该趁你还看着我的时候做作作秀[03:42.02]或趁我还在乎你的时候干些粗活[03:45.35]诱惑太多 矛盾不走[03:48.79]你还期待我坚持什么[03:53.21][03:54.38]快找不到我是谁[03:59.31]每次自我介绍[04:02.99]都像在心上轻轻划一刀[04:07.87]看不出来这该是谁[04:12.67][04:14.65]曝光或黑暗的都在别的次元[04:19.12]我没有感觉[04:21.65]'
        },
        {
            song: '极限',
            singer: '徐佳莹',
            mp3Src: 'mp3/徐佳莹 - 极限.mp3',
            txt: '[00:01.54]Opening 极限 - 徐佳莹[00:05.11]词：徐佳莹 葛大为[00:08.98]曲：徐佳莹[00:11.04][02:09.09]对占星执迷 需要空洞的鼓励[02:15.51][02:18.51]才认清自己[02:20.82]逞强终究 只是逃避[02:25.68][02:28.12]放弃止痛剂 跟记忆 迎面交集[02:34.99][02:37.04]我依然坚持 回到家才哭泣[02:41.72][02:44.59]我的极限 就到这里 就算永远 不能痊愈[02:54.53]太害怕安静 所以习惯 自言自语[03:01.35][03:03.79]你的极限 也在这里 别跨越 我失序的心[03:13.12][03:13.69]如果我是你 会更残酷离去[03:21.80][03:25.91]副作用不明 但意志 还算清醒[03:32.54][03:34.96]我真的庆幸 不曾自我否定[03:39.78][03:42.22]我的极限 就到这里 早该禁止 继续沉溺[03:52.16]在崩溃前夕 我会承认 我已失去[03:58.95][04:01.71]你的极限 也在这里 收回 最后一次感性[04:11.44]如果我是你 不会浪费同情[04:20.30][04:39.98]我的极限 就到这里 早该禁止 继续沉溺[04:48.84][04:49.65]在崩溃前夕 我要承认 我已失去[04:56.89][04:59.27]你的极限 也在这里 收回 最后一次感性[05:09.08]如果我是你 我会同情自己'
        },
        {
            song: '失落沙洲',
            singer: '徐佳莹',
            mp3Src: 'mp3/徐佳莹 - 失落沙洲.mp3',
            txt: '[00:00.32]徐佳莹 - 失落沙洲[00:07.53][00:09.45]词:徐佳莹 曲:徐佳莹[00:15.78][00:19.21][00:21.71]又来到这个港口 没有原因的拘留[00:32.87]我的心乘着斑剥的轻舟 寻找失落的沙洲[00:45.48]随时间的海浪漂流 我用力张开双手[00:56.90]拥抱那么多起起落落[01:03.45]想念的 还是你望着我的眼波[01:11.88][01:15.38]我不是一定要你回来 只是当又一个人看海[01:26.93]回头才发现你不在 留下我迂回的徘徊[01:39.43]我不是一定要你回来 只是当又把回忆翻开[01:51.33]除了你之外的空白 还有谁能来教我爱[02:00.14][02:25.90][02:33.52]又回到这个尽头 我也想再往前走[02:44.94]只是越看见海阔天空[02:51.35]越遗憾 没有你分享我的感动[02:59.35][03:03.20]我不是一定要你回来 只是当又一个人看海[03:15.07]回头才发现你不在 留下我迂回的徘徊[03:27.49]我不是一定要你回来 只是当又把回忆翻开[03:39.23]除了你之外的空白 还有谁能来教我爱[03:49.23][03:50.51]我不是一定要你回来 只是当又一个人看海[04:02.80]疲惫的身影不是我 不是你想看见的我[04:15.60]我不是一定要你回来 只是当独自走入人海[04:26.92]除了你之外的依赖 还有谁能教我勇敢[04:37.79]除了你之外的空白 还有谁能来教我爱'
        },
    ]

    var a = e('#id-audio-player')
    var off = {
        n: 0
    }
    playWay(off)
    autoPlay(a, songs, songDate, off)
    bindEventFirst(a, songs, songDate)
    bindEventLast(a, songs, songDate)
    playEventpauseAndplay(a)
    clicksong(a, songDate)
    changeText(a, songDate)
    controlPlay(a)
    drag(a)
    toggle(a)
    controlSound(a)
    muted(a)
    rotate(a)
}

var __main = function(){
    bindEvents()
}

__main()
