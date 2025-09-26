<?php
require 'gdt/gautentificationf5.php';
require_once '/data/dataweb/GoelandWeb/webservice/employe/clCNWSEmployeSecurite.php';
require_once 'gdt/cldbgoeland.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers:  *");
header("Access-Control-Allow-Methods:  POST");
$idCaller = 0;
if (array_key_exists('empid', $_SESSION)) {
    $idCaller = $_SESSION['empid'];
}
if ($idCaller > 0) {
    $pseudoWSEmployeSecurite = new CNWSEmployeSecurite();
    if ($pseudoWSEmployeSecurite->isInGroupe($idCaller, 'ISOProcessusSupprime')) {
        $jsonData = file_get_contents('php://input');
        $oData = json_decode($jsonData);
        $idISOProcessus = $oData->id;
        $dbgo = new DBGoeland();
        $sSql = "cn_ISOProcessus_supprime $idISOProcessus, $idCaller";
        $dbgo->queryRetNothing($sSql, 'W');
        unset($dbgo);
        echo '{"success": true, "message":"ok"}';
    } else {
        echo '{"success": false, "message":"ERREUR groupe ISOProcessusSupprime requis"}';
    }
} else {
    echo '{"success": false, "message":"ERREUR athentification F5"}';
}
