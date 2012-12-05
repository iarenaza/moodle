<?php

require_once(dirname(dirname(dirname(__FILE__))).'/config.php');

$authtype = 'ldap';

//HTTPS is required in this page when $CFG->loginhttps enabled
$PAGE->https_required();

$PAGE->set_url('/auth/'.$authtype.'/ntlmsso_finish.php');
$PAGE->set_context(context_system::instance());

// Define variables used in page
$site = get_site();

$authsequence = get_enabled_auth_plugins(true); // auths, in sequence
if (!in_array($authtype, $authsequence, true)) {
    print_error('ldap_isdisabled', 'auth');
}

$authplugin = get_auth_plugin($authtype);
if (empty($authplugin->config->ntlmsso_enabled)) {
    print_error('ntlmsso_isdisabled', 'auth_'.$authtype);
}

// If ntlmsso_finish() succeeds, then the code never returns,
// so we only worry about failure.
if (!$authplugin->ntlmsso_finish()) {
    // Redirect to login, saying "don't try again!"
    // Display the page header. This makes redirect respect the timeout we specify
    // here (and not add 3 more secs).
    $loginsite = get_string("loginsite");
    $PAGE->navbar->add($loginsite);
    $PAGE->set_title("$site->fullname: $loginsite");
    $PAGE->set_heading($site->fullname);
    echo $OUTPUT->header();
    redirect($CFG->httpswwwroot . '/login/index.php?auth'.$authtype.'_skipntlmsso=1',
             get_string('ntlmsso_failed','auth_'.$authtype), 3);
}
