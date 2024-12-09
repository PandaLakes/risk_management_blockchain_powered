// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Gestionnaire de Risque de Contrepartie
/// @notice Un système simplifié de gestion des risques de contrepartie utilisant la blockchain.
/// @dev Exemples éducatifs. Non destiné à la production sans audit et test approfondis.
contract riskma {
    // ---------------------------------------------------------------------------------------------
    // Structures de données
    // ---------------------------------------------------------------------------------------------
    struct Contrepartie {
        address portefeuille;
        uint256 scoreCredit;        // Doit être > 0
        uint256 limiteExposition;   // Doit être > 0
        uint256 expositionCourante; // Somme absolue des expositions nettes
        uint256 collateral;
        bool estActif;
    }

    // ---------------------------------------------------------------------------------------------
    // Variables d'état
    // ---------------------------------------------------------------------------------------------
    address public owner;

    // Contreparties identifiées par leur adresse
    mapping(address => Contrepartie) public contreparties;

    // Expositions nettes entre deux contreparties
    mapping(address => mapping(address => int256)) public netExpositions;

    // Liste globale des contreparties pour pouvoir recalculer l'exposition
    address[] public allCounterparties;

    // ---------------------------------------------------------------------------------------------
    // Événements
    // ---------------------------------------------------------------------------------------------
    event ContrepartieAjoutee(address indexed contrepartie, uint256 limiteExposition, uint256 scoreCredit);
    event ExpositionMiseAJour(address indexed initiateur, address indexed contrepartie, int256 nouvelleExposition);
    event LimiteDepassee(address indexed contrepartie, uint256 expositionActuelle, uint256 limiteExposition);
    event AlerteRisque(address indexed contrepartie, string typeAlerte, uint256 valeur);
    event CollateralMiseAJour(address indexed contrepartie, uint256 nouveauCollateral);
    event TransactionEffectuee(address indexed from, address indexed to, int256 montant, uint256 timestamp);

    // ---------------------------------------------------------------------------------------------
    // Modificateurs
    // ---------------------------------------------------------------------------------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "Acces reserve au proprietaire");
        _;
    }

    modifier contrepartieActive(address _cp) {
        require(contreparties[_cp].estActif, "Contrepartie inactive ou inexistante");
        _;
    }

    // ---------------------------------------------------------------------------------------------
    // Constructeur
    // ---------------------------------------------------------------------------------------------
    constructor() {
        owner = msg.sender;
    }

    // ---------------------------------------------------------------------------------------------
    // Fonctions d'administration
    // ---------------------------------------------------------------------------------------------
    function ajouterContrepartie(
        address _portefeuille,
        uint256 _scoreCredit,
        uint256 _limiteExposition
    ) public onlyOwner {
        require(_portefeuille != address(0), "Adresse invalide");
        require(contreparties[_portefeuille].portefeuille == address(0), "Contrepartie existe deja");
        require(_scoreCredit > 0, "Score de credit doit etre > 0");
        require(_limiteExposition > 0, "Limite exposition doit etre > 0");

        contreparties[_portefeuille] = Contrepartie({
            portefeuille: _portefeuille,
            scoreCredit: _scoreCredit,
            limiteExposition: _limiteExposition,
            expositionCourante: 0,
            collateral: 0,
            estActif: true
        });

        if (!isCounterpartyInList(_portefeuille)) {
            allCounterparties.push(_portefeuille);
        }
        emit ContrepartieAjoutee(_portefeuille, _limiteExposition, _scoreCredit);
    }

    function isCounterpartyInList(address _portefeuille) internal view returns (bool) {
        for (uint256 i = 0; i < allCounterparties.length; i++) {
            if (allCounterparties[i] == _portefeuille) {
                return true;
            }
        }
        return false;
    }

    // ---------------------------------------------------------------------------------------------
    // Fonctions de mise à jour
    // ---------------------------------------------------------------------------------------------
    function mettreAJourExposition(address _portefeuille, uint256 _nouvelleExposition) public {
        Contrepartie storage contrepartie = contreparties[_portefeuille];
        require(contrepartie.estActif, "Contrepartie inactive");

        uint256 expositionCourante = contrepartie.expositionCourante;
        expositionCourante += _nouvelleExposition;
        contrepartie.expositionCourante = expositionCourante;

        emit ExpositionMiseAJour(msg.sender, _portefeuille, int256(expositionCourante));

        _verifierAlertesEtLimites(_portefeuille);
    }

    function mettreAJourCollateral(address _portefeuille, uint256 _nouveauCollateral) public onlyOwner {
        Contrepartie storage contrepartie = contreparties[_portefeuille];
        require(contrepartie.portefeuille != address(0), "Contrepartie inexistante");
        contrepartie.collateral = _nouveauCollateral;

        emit CollateralMiseAJour(_portefeuille, _nouveauCollateral);
        _verifierAlertesEtLimites(_portefeuille);
    }

    // ---------------------------------------------------------------------------------------------
    // Transactions et calcul des expositions
    // ---------------------------------------------------------------------------------------------
    function effectuerTransaction(
        address _to,
        int256 _montant
    ) public contrepartieActive(msg.sender) contrepartieActive(_to) {
        require(_montant != 0, "Montant ne peut etre 0");

        // Update the net exposures
        int256 currentExposure = netExpositions[msg.sender][_to];
        currentExposure += _montant;
        netExpositions[msg.sender][_to] = currentExposure;

        // Update the exposition courante for both parties
        if (_montant > 0) {
            // Outgoing transaction: sender loses exposure, receiver gains
            contreparties[msg.sender].expositionCourante -= uint256(_montant);
            contreparties[_to].expositionCourante += uint256(_montant);
        } else {
            // Incoming transaction: sender gains exposure, receiver loses
            uint256 absMontant = uint256(-_montant);
            contreparties[msg.sender].expositionCourante += absMontant;
            contreparties[_to].expositionCourante -= absMontant;
        }

        emit TransactionEffectuee(msg.sender, _to, _montant, block.timestamp);

        // Verify alerts and limits
        _verifierAlertesEtLimites(msg.sender);
        _verifierAlertesEtLimites(_to);
    }


    // ---------------------------------------------------------------------------------------------
    // Calculs du risque et vérifications
    // ---------------------------------------------------------------------------------------------
    function calculerRisque(address _portefeuille) public view returns (uint256) {
        Contrepartie memory c = contreparties[_portefeuille];
        require(c.limiteExposition > 0 && c.scoreCredit > 0, "Parametres invalides pour le risque");
        return (c.expositionCourante * 10000) / (c.limiteExposition * c.scoreCredit);
    }

    function calculerRatioCouverture(address _portefeuille) public view returns (uint256) {
        Contrepartie memory c = contreparties[_portefeuille];
        if (c.expositionCourante == 0) {
            return 100;
        }
        return (c.collateral * 100) / c.expositionCourante;
    }

    function _verifierAlertesEtLimites(address _portefeuille) internal {
        Contrepartie storage c = contreparties[_portefeuille];
        uint256 ratioCouverture = calculerRatioCouverture(_portefeuille);
        uint256 risque = calculerRisque(_portefeuille);

        if (c.expositionCourante > c.limiteExposition) {
            c.estActif = false;
            emit LimiteDepassee(_portefeuille, c.expositionCourante, c.limiteExposition);
        }

        if (ratioCouverture < 50) {
            emit AlerteRisque(_portefeuille, "Ratio de couverture faible", ratioCouverture);
        }

        if (risque > 200) {
            emit AlerteRisque(_portefeuille, "Score de risque eleve", risque);
        }
    }

    function getAllCounterparties() public view returns (address[] memory) {
        return allCounterparties;
    }
}