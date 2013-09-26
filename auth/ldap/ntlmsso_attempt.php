<?php

require_once(dirname(dirname(dirname(__FILE__))).'/config.php');

$authtype = 'ldap';

//HTTPS is required in this page when $CFG->loginhttps enabled
$PAGE->https_required();

$PAGE->set_url('/auth/'.$authtype.'/ntlmsso_attempt.php');
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

$sesskey = sesskey();

// Display the page header. This makes redirect respect the timeout we specify
// here (and not add 3 more secs) which in turn prevents a bug in both IE 6.x
// and FF 3.x (Windows version at least) where javascript timers fire up even
// when we've already left the page that set the timer.
$loginsite = get_string("loginsite");
$PAGE->navbar->add($loginsite);
$PAGE->set_title("$site->fullname: $loginsite");
$PAGE->set_heading($site->fullname);
echo $OUTPUT->header();

// $PAGE->https_required() up above takes care of what $CFG->httpswwwroot should be.
$msg = '<p>'.get_string('ntlmsso_attempting', 'auth_'.$authtype).'</p>'
    . '<img width="1", height="1" '
    . ' src="' . $CFG->httpswwwroot . '/auth/'.$authtype.'/ntlmsso_magic.php?sesskey='
    . $sesskey . '" />';
redirect($CFG->httpswwwroot . '/auth/'.$authtype.'/ntlmsso_finish.php', $msg, 3);
