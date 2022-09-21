const config = require('../../config')
const request = require("request");
const RedditMDParser = require('snuownd');
const Throbber = require('../../helpers/throbber');
/**
 * Simple Class to Interact with Reddit's JSON/API calls.
 */
class RedditPost {
    /**
     * Indicates if the system has gotten post data from reddit servers
     */
    #hasInit = false;
    #post = {};
    #comments = [];

    /**
     * Grabs the post and comments from reddit
     * @async
     * @param {URL} url reddit url to work with
     * @returns {Promise<RedditPost> | Promise<Error>} updated instance to work with. Returns Error instance if error
     */
    async init(url) {
        Throbber.init(`GRABBING POST AND COMMENTS FOR ` + url + `.`);
        let data = new Promise((resolve) => {
            request({ url: url, json: true, timeout: 2 * 60 * 1000 }, (err, res, body) => {
                if (err) resolve(new Error(err));
                else {
                    body = typeof body === 'string' ? JSON.parse(body) : body;
                    //We need posts and comments to only contain information we need for this project's scope. 
                    let { title, author } = body[0].data.children[0].data;
                    this.#setPost({ title, author })
                    this.#setComments(body[1].data.children.map(child => {
                        let { author, score, body } = child.data
                        return { author, score, body }
                    }));
                    this.setHasInit(true);
                    Throbber.succeed(`GRABBED POST AND COMMENTS FOR ` + url);
                    resolve(this)
                }
            })
        });
        return data;
    }
    /**
     * Gets the comment that has the highest score for the post you initialized.
     * @returns {Object | Boolean} comment 'thing' with the highest score for this.post. Returns false if not init
     */
    getHighestComment() {
        if (!this.#hasInit) return false;
        let sortComment = this.getComments().sort((a, b) => RedditPost.compareComments(a, b));
        let highestComment = sortComment[0];
        highestComment.body = this.#stripHTMLTags(this.parseRedditMarkdown(sortComment[0].body));
        return highestComment;
    }
    /**
     * Returns comments from the reddit post initialized.
     * @returns {[{author:String, score:Number, body:String}]} All comments from the reddit post
     */
    getComments() {
        if (!this.#hasInit) return false;
        let allComments = this.#comments.map(x => {
            let { author, score, body } = x;
            //Some results are undefined
            if (body == undefined) body = '';
            if (score == undefined) score = 0;
            if (author == undefined) author = '';
            let mBody = this.parseRedditMarkdown(body);
            mBody = this.#stripHTMLTags(body);
            return { author, score, body: mBody }
        })
        return allComments;
    }
    /**
     * Gets post from the reddit post initialized.
     * @returns {Object} Details on the reddit post.
     */
    getPost() {
        if (!this.#hasInit) return false;
        return this.#post
    }
    /**
     * Tells RedditPost Initialization status
     * @returns {Boolean} True if initialized, False otherwise
     */
    hasInit() {
        return this.#hasInit;
    }
    /**
     * Set RedditPost init status.
     * @param {Boolean} bool What do you want to set init status as?
     */
    setHasInit(bool) {
        this.#hasInit = bool;
    }
    /**
     * Set the reddit post to class.
     * @param {title: String, author: String} post data
     */
    #setPost(post) {
        this.#post = post;
    }
    /**
     * Set the reddit comments to class1
     * @param {[{author: String, score: Number, body: String}]} comments data
     */
    #setComments(comments) {
        this.#comments = comments;
    }
    /**
     * Uses Regex to replace html tag
     * @param {String} text
     * @returns {String} New version of the htmlString without the HTML tags 
     */
    #stripHTMLTags(text) {
        let stripped = text.replace(/(<([^>]+)>)/ig, '');
        return stripped;
    }
    /**
     *  Function to converts Reddit's Markdown to html string
     * @param {String} text markdown text
     * @returns {String} html version
     */
    parseRedditMarkdown(text) {
        return RedditMDParser.getParser().render(text);
    }
    /**
     * Function to compare two Reddit comments
     * @param {{author:String,score:Number,body:String}} a Comment A
     * @param {{author:String,score:Number,body:String}} b Comment B
     * @returns {Number | Boolean} -1 if a's score is greater than b, 1 if a's score is less than b and 0 when a's score is equal to b. Returns false on error.
     */
    static compareComments(a, b) {
        //Sorted for descending order. swap -1 and 1 for ascending.
        //Complexity is higher in exchange for security.
        if (a && a.score && b && b.score && typeof a.score === Number && typeof b.score === Number)
            return (a.score > b.score) ? -1 : (a.score === b.score) ? 0 : 1
        return false;
    }
}

module.exports = new RedditPost();