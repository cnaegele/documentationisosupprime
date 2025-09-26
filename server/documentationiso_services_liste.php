<?php
require_once 'gdt/cldbgoeland.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
$dbgo = new DBGoeland();
$sSql = 'cn_isoprocessus_services_liste';
//echo '{"message": "' . str_replace('"', '\"', $sSql) . '"}';
$bret = $dbgo->queryRetJson2($sSql);
if ($bret === true) {
    echo $dbgo->resString;
} else {
    http_response_code(400);
    echo 'cn_isoprocessus_services_liste:' . $dbgo->resErreur;
}
unset($dbgo);

