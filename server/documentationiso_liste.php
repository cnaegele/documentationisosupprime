<?php
require_once 'gdt/cldbgoeland.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
$idService = '0';
if (isset($_GET['jsoncriteres'])) {
    $jsonCriteres = $_GET['jsoncriteres'];
    $oCriteres = json_decode($jsonCriteres, false);
    if (isset($oCriteres->id)) {
        $idService = $oCriteres->id;
    }
}
$dbgo = new DBGoeland();
$bret = $dbgo->queryRetJson2("cn_isoprocessus_liste_par_service $idService");
if ($bret === true) {
    echo $dbgo->resString;
} else {
    http_response_code(400);
    echo 'cn_isoprocessus_liste_par_service:' . $dbgo->resErreur;
}
unset($dbgo);

