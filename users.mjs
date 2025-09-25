const users = [
    {'githubUsername': 'jamesfullspeed', 'bitbucketNickname': 'jamesfullspeed', 'slackMemberId': 'U015041JWTV'},
    {'githubUsername': 'JoshuaFradejas', 'bitbucketNickname': 'joshua.fradejas', 'slackMemberId': 'U03FWS5CF5X'},
    {'githubUsername': 'fornis-fullspeedtechnologies', 'bitbucketNickname': 'ricky.jonathan.fornis', 'slackMemberId': 'U018KQGDBFF'},
    {'githubUsername': 'shoshoNiwa', 'bitbucketNickname': 'niwa', 'slackMemberId': 'U025PM8T2U9'},
    {'githubUsername': '', 'bitbucketNickname': 'kcchang', 'slackMemberId': 'U03RKK4CZKQ'},
    {'githubUsername': '', 'bitbucketNickname': 'teng', 'slackMemberId': 'U05KUHDHPJ5'},
    {'githubUsername': '', 'bitbucketNickname': 'shimazaki', 'slackMemberId': 'U025PM8UQ57'},
    {'githubUsername': 'fi-mitsumune', 'bitbucketNickname': '光宗圭助', 'slackMemberId': 'UMZ8GKQBH'}
    // Add more users here
]

/**
 * Gets the slack member id using the GitHub username
 *
 * @param githubUsername
 * @returns {string|*}
 */
const findSlackMemberIdByGithubUsername = (githubUsername) => {
    const user =  users.find(user => user.githubUsername === githubUsername)
    return user?.slackMemberId ?? ''
}

/**
 * Gets the Github username using the slack member id
 *
 * @param slackMemberId
 * @returns {string|*}
 */
const findGithubUsernameBySlackMemberId = (slackMemberId) => {
    const user = users.find(user => user.slackMemberId === slackMemberId)
    return user?.githubUsername ?? ''
}

export {
    findSlackMemberIdByGithubUsername,
    findGithubUsernameBySlackMemberId
}