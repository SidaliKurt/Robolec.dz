`use strict`
import { C } from "./SaqrDebug.js"
//import { QRCodeGenerator } from "./QRcode.js"
import { lang } from "./lang.js"
import { Gemini } from "./ChatAI.js"
import { Air } from "./Saqr.js"

(function () {
  Air.SetLangPack(lang)
  Air.AddModule(Gemini)
  window.Air = Air
  window.C = C
  C.lang = {}
  document.lang = lang
  var lng = Object.getOwnPropertyNames(lang.trans)
  for (var i = 0; i < lng.length; i++) {
    C.lang[lng[i]] = lng[i]
  }

  Air.chat = new Gemini("AIzaSyARYh4L0hZwctgZZq9wFubZfVeyFy8KIpA")

  Air.data = {
    device: {
      id: "",
      browser: "",
      version: 0,

    },
    settings: {
      lang: 1,
      theme: 0,
      color: 0,
      size: 0,
    },
    address: [],
    user: {
      id: "",
      username: "beastOne",
      email: "example@gmail.com",
      name: "Ahmad",
      family: "Masry",
      age: "55",
      company: "",
      facebook: "@Blalblo",
      github: "gitto",
      youtube: "youtto",
      twitter: "twitto"

    },
    langs: [],
    skills: [],
    followers: [],
    following: [],
    plan: 0,
    rate: 5,
    payment: [],
    balance: 50000,
    version: 1.01

  }
  const bid = {
    id: 0,
    workerId: 0,
    projectId: 0,
    flag: 0xF,//sealed,highlight,sponsored
    desc: "",
    time: 0,
    milestones: [{ title: "", ratio: 0, }],
    files: []
  }
  const project = {
    id: 0,
    clientId: 0,
    flag: 0xF, //contest,urgent,sealed
    title: "",
    desc: "",
    time: "",
    deadline: 0,
    skills: [],
    min: 0,
    max: 0,
    currency: 0,
    files: []
  }
  const platformRate = {
    id: 0,
    userId: 0,
    review: "",
    rate: 0,
  }

  Air.Robolec = class {
    static Skill(id, color) {
      return Air.New.Layout.Div(
        Air.New.Text.Span("UI/UX")
      ).SetClass("skill").SetBackColor(color)
    }
    static SkillBar(ids, color) {
      var bar = Air.New.Layout.Hor()
      bar.classList.add("skillBar")
      for (var i = 0; i < ids.length; i++) {
        if (ids[i]) bar.appendChild(this.Skill(ids[i], color))
      }
      return bar
    }
    static CategCard(icon, categ, num, color) {
      return Air.New.Layout.Card(
        Air.New.Text.Icon(icon, color),
        Air.New.Text.H4(Air.T(categ)),
        Air.New.Text.H6(num + " " + Air.T("freelancer"))
      ).SetClass("categCard")//.Animate(C.ANIM.fadeIn)
    }
    static Logo() {
      return Air.New.Layout.Div(
        Air.New.Media.Image("images/robolec.webp").SetClass("icn")
      ).SetClass("logo")
    }
    static ConsoleLogo() {

    }
    static TextCard(icon, title, body) {
      return Air.New.Layout.Card(
        Air.New.Text.Icon(icon, "blue"),
        Air.New.Text.H4(title),
        Air.New.Text.Paragraph(body)
      ).SetClass("textCard")//.Animate(C.ANIM.fadeIn)
    }
    static UserHeader(name, job, rate, reviews) {
      return Air.New.Layout.Hor(
        Air.New.Form.Avatar(),
        Air.New.Layout.Ver(
          Air.New.Text.Bold(name),
          Air.New.Text.Small(job),
          rate ? Air.New.Layout.Hor(
            Air.Robolec.Stars(rate),
            Air.New.Text.Small("(" + reviews + Air.T("rev") + ")")
          ) : Air.New.Null()
        ).SetClass("userHeaderData")
      ).SetClass("userHeader")
    }
    static FeaturedFreelancer(name, job, rate, reviews, skills, bio, amount) {
      return Air.New.Layout.Card(
        Air.Robolec.UserHeader(name, job, rate, reviews),
        Air.Robolec.SkillBar(skills, C.THEME.secondaryColor),
        Air.New.Text.Small(bio),
        Air.New.Layout.Hor(
          Air.New.Text.Small(amount + "DZD"),
          Air.New.Button.Glow(Air.T("viewProfile"))
        ).SetGap(30)
      ).ToVertical()
    }
    static UserReview(name, job, rate, review) {
      return Air.New.Layout.Card(
        Air.Robolec.UserHeader(name, job),
        Air.Robolec.Stars(rate),
        Air.New.Text.Italic(review).SetTextSize(0.6),
      ).ToVertical()
    }
    static TrendProject(title, time, skills, desc, price, bids) {
      return Air.New.Layout.Card(
        Air.New.Layout.Hor(
          Air.New.Text.Bold(title).ToLeft().SetWidth(80),
          Air.Robolec.Skill(45).SetWidth(20)
        ).SetWidth(100),
        Air.New.Layout.Hor(
          Air.New.Text.Small(time).SetWidth(50),
          Air.New.Text.Small(bids).SetWidth(50)
        ).SetWidth(100),
        Air.Robolec.SkillBar(skills, C.THEME.secondaryColor).SetPadding(null, null, 2),
        Air.New.Text.Small(desc).ToLeft().SetWidth(100),
        Air.New.Layout.Hor(
          Air.New.Text.Bold(price).SetWidth(50),
          Air.New.Button.Outline(Air.T("viewDetails")).SetBorder(20)
        ).SetWidth(100),
      ).ToVertical()
    }
    static UserMenu() {
      return Air.New.Dialog.Menu("UserMenu",
        Air.New.Layout.Ver(
          Air.New.Text.Paragraph(Air.data.user.username),
          Air.New.Text.Small(Air.data.user.email),
          Air.New.Layout.Ver(
            Air.New.Text.Paragraph(Air.T("balance") + ":"),
            Air.New.Text.H3(Air.data.balance + " " + Air.T("dzd")).SetColor(C.THEME.primaryColor)
          )
        ),
        Air.New.Text.Small("Version: " + Air.data.version + " / 2025.01.25"),
        { text: Air.T("profile"), icon: "user" },
        { text: Air.T("analytics"), icon: "analytics" },
        { text: Air.T("notifications"), icon: "bell" },
        { text: Air.T("settings"), icon: "gear" },
        { text: Air.T("helpSupport"), icon: "question-circle" },
        { text: Air.T("inviteFriend"), icon: "share-alt" },
        { text: Air.T("signOut"), icon: "sign-out" },
      ).SetClass("S_userMenu").Animate(C.ANIM.slideInDown, null, 300).SetOnClick(function (ev) {
        this.Animate(C.ANIM.fadeOut, this.close, 300)
        Air.Page.GoTo(["profile", "analytics", "notify", "settings", "help", "invite", "home"][ev.target.idx])
      }).SetOnLeave(function () { this.Animate(C.ANIM.slideOutUp, this.remove, 200) })
    }
    static UserNotify() {
      return Air.New.Dialog.Menu("UserNotify", Air.New.Text.H3(Air.T("notifications")), null,
        { text: Air.T("profile"), icon: "user" },
        { text: Air.T("profile"), icon: "user" },
        { text: Air.T("profile"), icon: "user" },
        { text: Air.T("profile"), icon: "user" },
      ).SetClass("S_userMenu").Animate(C.ANIM.backInDown, null, 300).SetOnLeave(function () { this.Animate(C.ANIM.backOutRight, this.remove, 200) })
    }
    static UserMessage() {
      return Air.New.Dialog.Menu("UserMessage", Air.New.Text.H3(Air.T("messages")), null,
        { text: Air.T("profile"), icon: "user" },
        { text: Air.T("profile"), icon: "user" },
        { text: Air.T("profile"), icon: "user" },
        { text: Air.T("profile"), icon: "user" },
      ).SetClass("S_userMenu").Animate(C.ANIM.backInDown, null, 300).SetOnLeave(function () { this.Animate(C.ANIM.backOutRight, this.remove, 200) })
    }
    static Stars(num) {
      var str = Air.New.Layout.Div()
      str.classList.add("S_stars")
      for (var i = 1; i < 6; i++) {
        if (i <= num) {
          str.appendChild(Air.New.Text.Icon("star", C.COLOR.yellow.darken2))
        } else if (i - 0.5 <= num) {
          str.appendChild(Air.New.Text.Icon("star-half", C.COLOR.yellow.darken2))
        }
      }
      return str
    }
    static ThemePallet() {
      var thm = Air.New.Layout.Hor()
      var clr = Air.Theme.themes.filter(k => k.name.includes(Air.Theme.currentTheme.split("_")[0]))
      for (var i = 0; i < clr.length; i++) {
        thm.appendChild(Air.New.Layout.Div().SetClass("S_color").SetBackColor(clr[i].primaryColor).SetId(clr[i].name).SetOnHover(function () { Air.Theme.ApplyTheme(this.id) }))
      }
      return thm
    }
    static Notification(title, body, time) {
      return Air.New.Layout.Card(
        Air.New.Text.Icon("bell", C.COLOR.deepOrange.deepOrange).SetWidth(10),
        Air.New.Layout.Ver(
          Air.New.Text.Bold(title),
          Air.New.Text.Small(body)
        ).SetWidth(70).SetPadding(null, 2).Exec(function () { this.style.alignItems = "flex-start" }),
        Air.New.Text.Small(time).SetWidth(20)
      ).SetWidth(100)
    }
    static ProjectType(id = 0) {
      var icn, txt
      switch (id) {
        case 0:
          txt = "freelance"
          icn = "computer"
          break
        case 1:
          txt = "bugBounty"
          icn = "bug"
          break
        case 2:
          txt = "fullTime"
          icn = "building"
          break
        case 3:
          txt = "partTime"
          icn = "briefcase-clock"
          break
        case 4:
          txt = "contract"
          icn = "file-award"
          break
      }
      return Air.New.Layout.Hor(
        Air.New.Text.Icon(icn, C.COLOR.green.green).SetWidth(20),
        Air.New.Text.Small(Air.T(txt)).SetWidth(80)
      )
    }
    static ProjectLink(title, desc, flag, price, skills,) {
      return Air.New.Layout.Card(
        Air.New.Layout.Hor(Air.New.Text.Bold(title).SetWidth(70), Air.New.Layout.Hor().SetWidth(30)),
        Air.New.Layout.Hor(
          Air.New.Layout.Hor(
            Air.New.Layout.Hor(
              Air.New.Text.Icon("money-bill-wave", C.COLOR.green.green).SetWidth(20),
              Air.New.Text.Small(price).SetWidth(80)
            ),
          ).SetWidth(33),
          Air.Robolec.ProjectType().SetWidth(33),
          Air.New.Layout.Hor(
            Air.New.Layout.Hor(
              Air.New.Text.Icon("money-bill-wave", C.COLOR.green.green).SetWidth(20),
              Air.New.Text.Small(price).SetWidth(80)
            ),
          ).SetWidth(33),
        ),
        Air.New.Layout.Hor(
          Air.New.Layout.Hor(Air.New.Text.Small(desc).SetWidth(100),),
        ),
        Air.Robolec.SkillBar(skills, C.THEME.secondaryColor),
        Air.New.Layout.Hor(
          Air.New.Layout.Hor(
            Air.New.Text.Icon("money-bill-wave", C.COLOR.green.green).SetWidth(20),
            Air.New.Text.Small(price).SetWidth(80)
          ),
          Air.New.Layout.Hor(
            Air.New.Button.Invert(Air.T("save")).SetBorder(20),
            Air.New.Button.Outline(Air.T("applyNow")).SetBorder(20).NoWrap(true)
          ).SetWidth(50)
        )
      ).ToVertical().Animate(C.ANIM.backInLeft).SetClass("S_projectLink")
    }
  }


  //Home Page
  Air.Page.Add("home",
    Air.New.Layout.Header(
      Air.Robolec.Logo().SetOnClick(function () { Air.Page.GoTo("home") }), //briefcase 
      Air.New.Nav.Horz([Air.T("findJobs"), Air.T("findFreelancers"), Air.T("howItWorks")], function (id) {
        var page = "projects,freelance,howWorks".split(",")
        Air.Page.GoTo(page[id])
      }),
      Air.New.Layout.Div(
        Air.New.Button.ButtonIcon("comment-alt-lines").SetOnHover(function () {
          var bnd = this.getBoundingClientRect()
          Air.Robolec.UserMessage().style.left = (bnd.left - bnd.width) + "px"
        }).SetOnClick(Air.Robolec.UserMessage),
        Air.New.Button.ButtonIcon("bell").SetOnHover(function () {
          var bnd = this.getBoundingClientRect()
          Air.Robolec.UserNotify().style.left = (bnd.left - bnd.width) + "px"
        }).SetOnClick(Air.Robolec.UserNotify),
        Air.New.Button.Outline(Air.T("dashboard")).SetBorder(30).SetOnClick(function () {
          Air.Page.GoTo("dashboard")
        }).SetMargin(5),
        Air.New.Form.Avatar().SetOnHover(Air.Robolec.UserMenu).SetOnClick(Air.Robolec.UserMenu).SetClass("S_avatar"),
      ).ToCenter()
    ).SetPadding(4, 4),
    Air.New.Layout.Main(
      Air.New.Layout.Section(
        Air.New.Media.Image("images/robolec.webp").SetWidth(60),
        Air.New.Text.H1(Air.T("a1")),
        Air.New.Layout.Div(
          Air.New.Button.Flat(Air.T("exploreMarket")).SetWidth(15).SetBorder(20),
          Air.New.Button.Outline(Air.T("tryAITool")).SetWidth(15).SetBorder(20)
        ).ToHorizontal().SetGap(2).SetWidth(100).ToCenter()
      ).SetBackColor(C.THEME.secondaryBgColor).SetRef("hell"),
      Air.New.Layout.Section(
        Air.New.Text.H3(Air.T("whatTheySay")),
        Air.New.Text.Paragraph(Air.T("whatTheySayWord")).SetPadding(20, 20),
        Air.New.Layout.Grid(3,
          Air.Robolec.UserReview("Jake Paol", "Reverse Engineer", 4.5, "Review Real"),
          Air.Robolec.UserReview("Jake Paol", "Reverse Engineer", 4.5, "Review Real"),
          Air.Robolec.UserReview("Jake Paol", "Reverse Engineer", 4.5, "Review Real"),
        ),
      ),
      Air.New.Layout.Section(
        Air.New.Text.H3(Air.T("readyStart")),
        Air.New.Text.Paragraph(Air.T("readyStartWord")).SetPadding(20, 20),
        Air.New.Layout.Div(
          Air.New.Button.Invert(Air.T("learnMore")).SetBorder(20).SetOnClick(function () { Air.Page.GoTo("howWorks") }),
          Air.New.Button.Flat(Air.T("joinUsNow")).SetBorder(20).SetOnClick(function () { Air.Page.GoTo("login") }),
        ).ToVertical()
      ).SetBackColor("var(--secondaryColor)"),
    ),
    Air.New.Layout.Footer(
      Air.New.Layout.Grid(4,
        Air.New.Layout.Div(
          Air.Robolec.Logo(),
          Air.New.Text.Small(Air.T("footerWord")).SetTextSize(0.5),
          Air.New.Layout.Div()
        ).SetHeight(100).ToVertical(),
        Air.New.Layout.Div(
          Air.New.Text.H5(Air.T("forClients")),
          Air.New.Form.List(Air.T("Link 1"), Air.T("Link 2"), Air.T("Link 3"), Air.T("Link 4"), Air.T("Link 5"),)
        ).SetHeight(100).ToVertical(),
        Air.New.Layout.Div(
          Air.New.Text.H5(Air.T("forFreelancers")),
          Air.New.Form.List(Air.T("Link 1"), Air.T("createProfile"), Air.T("Link 3"), Air.T("community"), Air.T("successStories"),)
        ).SetHeight(100).ToVertical(),
        Air.New.Layout.Div(
          Air.New.Text.H5(Air.T("Categ 1")),
          Air.New.Form.List(Air.T("Link 1"), Air.T("Link 2"), Air.T("Link 3"), Air.T("Link 4"), Air.T("Link 5"),)
        ).SetHeight(100).ToVertical()
      ),
      Air.New.Layout.Divider(),
      Air.New.Layout.Div(
        Air.New.Text.Small(Air.T("allRightsReserved")),
        Air.New.Layout.Div(
          Air.New.Button.Elegant(Air.T("privacyPolicy")),
          Air.New.Button.Elegant(Air.T("termsService")),
          Air.New.Button.Elegant(Air.T("cookiePolicy")),
        ).SetPadding(null, 30)
      ).ToHorizontal()
    ),
  )


  //How It Works Page
  Air.Page.Add("howWorks",
    Air.Page.pages.home[0],
    Air.New.Layout.Main(
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("howRobolecs")),
        Air.New.Text.Paragraph(Air.T("howRobolecsBody")).SetPadding(20, 20),
      ),
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("simplePowerful")),
        Air.New.Text.Paragraph(Air.T("simplePowerfulBody")).SetPadding(20, 20),
        Air.New.Layout.Grid(3,
          Air.Robolec.TextCard("suitcase", Air.T("simplePowerfulOne"), Air.T("simplePowerfulOneBody")),
          Air.Robolec.TextCard("search-dollar", Air.T("simplePowerfulTwo"), Air.T("simplePowerfulTwoBody")),
          Air.Robolec.TextCard("star", Air.T("simplePowerfulThree"), Air.T("simplePowerfulThreeBody")),
        ),
      ),
      Air.New.Layout.Section(
        Air.New.Text.Small(Air.T("forClients")).SetColor(C.THEME.accentColor),
        Air.New.Text.H1(Air.T("findPerfectTalent")),
        Air.New.Text.Paragraph(Air.T("findPerfectTalentBody")).SetPadding(20, 20),
        Air.New.Layout.Grid(3,
          Air.Robolec.TextCard("user-group", Air.T("findWorkGrowOne"), Air.T("findPerfectTalentOneBody")),
          Air.Robolec.TextCard("shield-check", Air.T("findPerfectTalentTwo"), Air.T("findPerfectTalentTwoBody")),
          Air.Robolec.TextCard("circle-check", Air.T("findPerfectTalentThree"), Air.T("findPerfectTalentThreeBody")),
        ),
        Air.New.Button.Outline(Air.T("postProject")).SetBorder(20),
      ),
      Air.New.Layout.Section(
        Air.New.Text.Small(Air.T("forFreelancers")).SetColor(C.THEME.accentColor),
        Air.New.Text.H1(Air.T("findWorkGrow")),
        Air.New.Text.Paragraph(Air.T("findWorkGrowBody")).SetPadding(20, 20),
        Air.New.Layout.Grid(3,
          Air.Robolec.TextCard("suitcase", Air.T("findWorkGrowOne"), Air.T("findWorkGrowOneBody")),
          Air.Robolec.TextCard("sack-dollar", Air.T("findWorkGrowTwo"), Air.T("findWorkGrowTwoBody")),
          Air.Robolec.TextCard("award", Air.T("findWorkGrowThree"), Air.T("findWorkGrowThreeBody")),
        ),
        Air.New.Button.Outline(Air.T("createYourProfile")).SetBorder(20),
      ),
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("successStories")),
        Air.New.Text.Paragraph(Air.T("successStoriesBody")).SetPadding(20, 20),
        Air.New.Layout.Grid(3,
          Air.Robolec.TextCard("user-group", Air.T("findPerfectTalentOne"), Air.T("findPerfectTalentOneBody")),
          Air.Robolec.TextCard("shield-check", Air.T("findPerfectTalentTwo"), Air.T("findPerfectTalentTwoBody")),
          Air.Robolec.TextCard("circle-check", Air.T("findPerfectTalentThree"), Air.T("findPerfectTalentThreeBody")),
        ),
      ),
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("frequencyAsked")),
        Air.New.Text.Paragraph(Air.T("frequencyAskedBody")).SetPadding(20, 20),
        Air.New.Layout.Grid(2,
          Air.Robolec.TextCard("suitcase", Air.T("frequencyAskedOne"), Air.T("frequencyAskedOneBody")),
          Air.Robolec.TextCard("badge-percent", Air.T("frequencyAskedTwo"), Air.T("frequencyAskedTwoBody")),
          Air.Robolec.TextCard("money-bill-trend-up", Air.T("frequencyAskedThree"), Air.T("frequencyAskedThreeBody")),
          Air.Robolec.TextCard("hand-holding-circle-dollar", Air.T("frequencyAskedFour"), Air.T("frequencyAskedFourBody")),
          Air.Robolec.TextCard("chart-mixed-up-circle-dollar", Air.T("frequencyAskedFive"), Air.T("frequencyAskedFiveBody")),
          Air.Robolec.TextCard("shield-alt", Air.T("frequencyAskedSix"), Air.T("frequencyAskedSixBody")),
        ),
        Air.New.Text.Paragraph(Air.T("stillQuestions")),
        Air.New.Button.Invert(Air.T("contactSupport")).SetBorder(20).SetOnClick(function () { Air.Page.GoTo("help") }),
      ),
      Air.New.Layout.Section(
        Air.New.Text.H3(Air.T("readyStart")),
        Air.New.Text.Paragraph(Air.T("readyStartWord")).SetPadding(20, 20),
        Air.New.Layout.Div(
          Air.New.Button.Flat(Air.T("createAnAccount")).SetBorder(20).SetOnClick(function () { Air.Page.GoTo("login") }),
          Air.New.Button.Invert(Air.T("browseProjects")).SetBorder(20).SetOnClick(function () { Air.Page.GoTo("projects") }),
        )
      ).SetBackColor("var(--secondaryColor)"),
    ),
    Air.Page.pages.home[2]
  )

  //Settings Page
  Air.Page.Add("settings",
    Air.Page.pages.home[0],
    Air.New.Layout.Main(
      Air.New.Text.H1(Air.T("settings")),
      Air.New.Layout.Section(
        Air.New.Nav.Sidebar(
          [Air.T("general"), Air.T("profile"), Air.T("notifications"), Air.T("payment"), Air.T("account")],
          function (idx) {
            Air.State.Set("settingMenu", idx)
          }
        ).SetWidth(25).SetMargin(2).NewState("settingMenu", 0, function (idx, elm) {
          for (var i = 0; i < elm.length; i++) {
            if (i == idx) {
              elm[i].Show()//.Animate(C.ANIM.fadeInUpBig)
            } else {
              elm[i].Gone()//.Animate(C.ANIM.fadeOutUpBig,elm[i].Gone)
            }
          }
        }),
        Air.New.Layout.Card(
          Air.New.Layout.Ver(//General
            Air.New.Form.Form(true,
              { label: Air.T("theme"), body: Air.New.Layout.Div(Air.New.Button.ButtonIcon("sun-bright", Air.T("light")).SetOnClick(function () { this.isDark = !this.isDark; Air.Theme[this.isDark ? "Dark" : "Light"]() })) },
              { label: Air.T("color"), body: Air.Robolec.ThemePallet() },
              { label: Air.T("fontSize"), body: Air.New.Layout.Div() },
              { label: Air.T("language"), body: Air.New.Input.Select([{ text: "Arabic" }, { text: "English" }, { text: "French" },]) },
            ),
          ).AddState("settingMenu"),
          Air.New.Layout.Ver(//Profile
            Air.New.Form.Form(true,
              { label: Air.T("firstName"), body: Air.New.Input.Text(Air.T("firstName")).SetRequired(true) },
              { label: Air.T("lastName"), body: Air.New.Input.Text(Air.T("lastName")).SetRequired(true) },
              { label: Air.T("address"), body: Air.New.Input.Text(Air.T("address")) },
              { label: Air.T("city"), body: Air.New.Input.Text(Air.T("city")) },
              { label: Air.T("country"), body: Air.New.Input.Text(Air.T("country")) },
            ),
          ).Gone().AddState("settingMenu"),
          Air.New.Layout.Ver(//Notifications
            Air.New.Form.Form(true,

            )
          ).Gone().AddState("settingMenu"),
          Air.New.Layout.Ver(//Payments
            Air.New.Layout.Div(
              Air.New.Input.Text(Air.T("Username")),
              Air.New.Input.Text(Air.T("Avatar")),
            ),
            Air.New.Layout.Div(
              Air.New.Input.Text(Air.T("Name")),
              Air.New.Input.Text(Air.T("Family")),
            ),
          ).Gone().AddState("settingMenu"),
          Air.New.Layout.Ver(//Account
            //Air.New.Layout.Div(
            Air.New.Form.Form(true,
              { label: Air.T("deactivateAccount"), body: Air.New.Button.Invert(Air.T("deactivateAccount")) },
              { label: Air.T("deleteAccount"), body: Air.New.Button.Flat(Air.T("deleteAccount")) },
            )
            //),
          ).Gone().AddState("settingMenu"),
        ).SetWidth(50).SetHeight(100)
      ).ToHorizontal().SetPadding(3, 3)
    ),
    Air.Page.pages.home[2]
  )

  //Notifications Page
  Air.Page.Add("notify",
    Air.Page.pages.home[0],
    Air.New.Layout.Main(
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("notifications")),
        Air.New.Text.H3(Air.T("recentNotifications")),
        Air.New.Layout.Grid(
          Air.Robolec.Notification("Milestone Recieved", "Body", "2 hour"),
          Air.Robolec.Notification("Milestone Recieved", "Body", "2 hour"),
          Air.Robolec.Notification("Milestone Recieved", "Body", "2 hour"),
          Air.Robolec.Notification("Milestone Recieved", "Body", "2 hour"),
          Air.Robolec.Notification("Milestone Recieved", "Body", "2 hour"),
        ).ToVertical().SetWidth(90),
        Air.New.Button.Invert(Air.T("settings")).SetBorder(20).SetOnClick(function () { Air.Page.GoTo("settings") })
      )
    ),
    Air.Page.pages.home[2]
  )

  //Profile Page
  Air.Page.Add("profile",
    Air.Page.pages.home[0],
    Air.New.Layout.Main(
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("profile")),

      ).ToHorizontal()
    ),
    Air.Page.pages.home[2]
  )

  //Help Page
  Air.Page.Add("help",
    Air.Page.pages.home[0],
    Air.New.Layout.Main(
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("helpSupport")),
      ).ToHorizontal()
    ),
    Air.Page.pages.home[2]
  )

  //Analytics Page
  Air.Page.Add("analytics",
    Air.Page.pages.home[0],
    Air.New.Layout.Main(
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("analytics")),

      )
    ),
    Air.Page.pages.home[2]
  )

  //Settings Page
  Air.Page.Add("help",
    Air.Page.pages.home[0],
    Air.New.Layout.Main(
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("helpSupport")),
        Air.New.Input.Search(Air.T("searchHelp"))
      ),
      Air.New.Layout.Section(
        Air.New.Layout.Card(
          Air.New.Text.H3(Air.T("contactSupport")),
          Air.New.Form.Form(true,
            { label: Air.T("subject"), body: Air.New.Input.Text() },
            { label: Air.T("description"), body: Air.New.Input.Textarea() },
            { label: Air.T("priority"), body: Air.New.Input.Select([{ text: Air.T("low") }, { text: Air.T("medium") }, { text: Air.T("high") }, { text: Air.T("urgent") },]) },
            { label: Air.T("attachements"), body: Air.New.Input.Dropzone(Air.T("Upload files here")) },
          ),
          Air.New.Button.Outline(Air.T("submit")).SetBorder(20)
        ).ToVertical().SetWidth(50)
      )

    ),
    Air.Page.pages.home[2]
  )

  //Projects Page
  Air.Page.Add("login",
    Air.Page.pages.home[0],
    Air.New.Layout.Main(
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("signIn")),
        Air.New.Text.Paragraph(Air.T("joinRobolecers")),
        Air.New.Layout.Card(
          Air.New.Form.Form(true,
            { label: Air.T("username"), body: Air.New.Input.Text(Air.T("emailUsername")) },
            { label: Air.T("password"), body: Air.New.Input.Password(Air.T("password")) },
          ),
          Air.New.Button.Outline(Air.T("signIn")).SetBorder(20),
          Air.New.Layout.Divider(80),
          Air.New.Text.Small(Air.T("Create A Account")),
          Air.New.Button.Invert(Air.T("signUp")),
          Air.New.Layout.Hor(
            Air.New.Media.Image("images/google.webp").SetWidth(20),
            Air.New.Media.Image("images/apple.webp").SetWidth(20),
          ),

        ).ToVertical().SetWidth(40)
      )
    ),
    Air.Page.pages.home[2],
  )

  //Invite Page
  Air.Page.Add("invite",
    Air.Page.pages.home[0],
    Air.New.Layout.Main(
      Air.New.Layout.Section(
        Air.New.Text.H1(Air.T("inviteFriend")),
      )
    ),
    Air.Page.pages.home[2]
  )

  //Membership Page
  Air.Page.Add("membership",
    Air.Page.pages.home[0],
    Air.New.Layout.Main(
      Air.New.Text.H1(Air.T("inviteFriend")),
      Air.New.Layout.Section(

      )
    ),
    Air.Page.pages.home[2]
  )

  //Preview
  Air.Theme.Light("Blue")
  Air.Page.Route("home")
  Air.SetTitle("Robolec - " + Air.T("title"))





  /*var vid=Air.New.Media.Video("wallpapers/sky_sunset.mp4").SetClass("S_wallpaper")
  vid.loop=true
  vid.autoplay=true
  document.body.appendChild(vid)
  Air.vid=vid*/

})()