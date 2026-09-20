// dsh-voix-locale — moitié CLIENT (navigateur).
//
// Bundle « lazy-CJS » ÉCRIT À LA MAIN, sans aucune construction.
// Précédent mesuré sur cette machine : dsh-sysmon/lib/client.js l. 1-3 —
//   « Hand-written lazy-CJS bundle (no build step, no dsh imports). »
// Forme du chargeur : dsh-sysmon/lib/client.js l. 6-9 et 128-131.
//
// CE QUE CE FICHIER FAIT : il pose un bouton micro avant le bouton d'envoi du
// composeur, capte le micro DE LA PAGE (donc indépendamment du focus, contrairement
// à la dictée de Windows), envoie l'audio à sa propre moitié hôte en MÊME ORIGINE,
// puis écrit le texte transcrit DANS LA CONVERSATION.
//
// ⚠️ SQUELETTE — jamais exécuté. Deux points sont explicitement non vérifiés et
//    isolés dans le code : la disponibilité de `require('react')` et le nom du
//    service `slots`. Voir README.md.

window.__ModuleLoader__.load({
  id: 'dsh-voix-locale',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports

    // ─────────────────────────────────────────────────────────────────────────
    // ⚠️ POINT NON VÉRIFIÉ N° 1 — l'accès à React.
    //
    // dsh-client-modules/README.md l. 41 décrit une table de base gelée
    // (« PLATFORM_MODULES: React, Cordis, and static UI libraries »), et l. 42
    // dit que tout bundle dynamique résout ses externes contre cette table.
    // MAIS : 0 occurrence de « PLATFORM_MODULES » dans les paquets installés
    // (elle est probablement minifiée), et les deux greffons tiers que j'ai lus
    // (dsh-sysmon, dsh-mermaid) ne font AUCUN import du harnais.
    //
    // Donc : c'est une lecture de documentation, pas une mesure.
    // C'est le PREMIER caractère à changer si la page reste blanche.
    // ─────────────────────────────────────────────────────────────────────────
    var React
    try {
      React = require('react')
    } catch (e) {
      // On ne masque pas l'échec : un greffon client qui ne peut pas se monter
      // doit se voir dans la console, pas disparaître en silence.
      console.error('[voix-locale] React indisponible depuis le bundle client :', e)
      exports.apply = function () {}
      exports.inject = []
      return module.exports
    }

    var h = React.createElement
    var useState = React.useState
    var useRef = React.useRef

    /** Route de transcription, servie par notre propre moitié hôte sur le 3080. */
    var ROUTE_TRANSCRIRE = '/voix-local/transcrire'

    /** Type MIME produit par MediaRecorder. `serveur-voix.py` l. 1668 accepte « .webm ». */
    function typeMime() {
      if (typeof MediaRecorder === 'undefined') return null
      var candidats = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
      for (var i = 0; i < candidats.length; i++) {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(candidats[i])) return candidats[i]
      }
      return null
    }

    /** Envoie les octets audio à la moitié hôte et rend le texte transcrit. */
    function envoyerAudio(blob) {
      return blob.arrayBuffer().then(function (tampon) {
        return fetch(ROUTE_TRANSCRIRE, {
          method: 'POST',
          headers: { 'content-type': 'application/octet-stream' },
          body: tampon,
        })
      }).then(function (reponse) {
        return reponse.json().then(function (donnees) {
          if (!reponse.ok || !donnees || donnees.ok !== true) {
            throw new Error((donnees && donnees.erreur) || ('HTTP ' + reponse.status))
          }
          return String(donnees.texte || '').trim()
        })
      })
    }

    var STYLES = {
      bouton: {
        appearance: 'none',
        minWidth: 30,
        height: 30,
        padding: '0 8px',
        marginRight: 4,
        border: '1px solid rgba(127,127,127,.35)',
        borderRadius: 6,
        background: 'transparent',
        color: 'inherit',
        cursor: 'pointer',
        font: 'inherit',
        lineHeight: '28px',
      },
      actif: { borderColor: '#e5484d', color: '#ffb4ab', background: 'rgba(229,72,77,.14)' },
      occupe: { opacity: 0.6, cursor: 'progress' },
      erreur: {
        position: 'absolute',
        bottom: '110%',
        right: 0,
        maxWidth: 320,
        padding: '4px 8px',
        borderRadius: 6,
        background: 'rgba(229,72,77,.95)',
        color: '#fff',
        font: '12px/1.4 sans-serif',
        whiteSpace: 'pre-wrap',
      },
    }

    /**
     * Le bouton micro. Reçoit `inputActions` du composeur — c'est la face publique
     * fournie à TOUT composant d'emplacement de portée `session` :
     *   dsh-client-ui-conversation/…/contract/slots.d.ts l. 241-248  (SessionStandardProps.inputActions)
     *   dsh-client-ui-conversation/…/contract/input.d.ts  l. 211-220 (setDraft / submit)
     *
     * @param {{ inputActions: { setDraft: Function, submit: Function } }} props
     */
    function BoutonMicro(props) {
      var actions = props && props.inputActions
      var etat = useState('repos')            // repos | ecoute | occupe
      var phase = etat[0]
      var setPhase = etat[1]
      var msg = useState(null)
      var erreur = msg[0]
      var setErreur = msg[1]
      var enregistreur = useRef(null)
      var flux = useRef(null)
      var morceaux = useRef([])

      function arreter() {
        var r = enregistreur.current
        if (r && r.state !== 'inactive') r.stop()
      }

      function relacherMicro() {
        var f = flux.current
        if (f) f.getTracks().forEach(function (piste) { piste.stop() })
        flux.current = null
      }

      function demarrer() {
        setErreur(null)
        if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          // Cause la plus probable, et elle n'est PAS un bug du module : getUserMedia
          // exige un CONTEXTE SÉCURISÉ. 127.0.0.1 en est un ; une IP de réseau local
          // ou un nom de domaine en http:// n'en sont pas.
          setErreur("micro indisponible : la page n'est pas dans un contexte sécurisé (utiliser http://127.0.0.1:3080, pas une IP de réseau local)")
          return
        }
        var mime = typeMime()
        if (!mime) { setErreur('MediaRecorder ne propose aucun format accepté par le service vocal'); return }

        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (f) {
          flux.current = f
          morceaux.current = []
          var r = new MediaRecorder(f, { mimeType: mime })
          enregistreur.current = r
          r.ondataavailable = function (e) { if (e.data && e.data.size > 0) morceaux.current.push(e.data) }
          r.onerror = function (e) { setErreur('MediaRecorder : ' + String((e && e.error) || e)); setPhase('repos'); relacherMicro() }
          r.onstop = function () {
            relacherMicro()
            var blob = new Blob(morceaux.current, { type: mime })
            if (blob.size === 0) { setPhase('repos'); return }
            setPhase('occupe')
            envoyerAudio(blob)
              .then(function (texte) {
                setPhase('repos')
                if (!texte) { setErreur('rien de reconnaissable dans cet enregistrement'); return }
                // ⭐ C'EST ICI QUE LE TEXTE ENTRE DANS LA CONVERSATION.
                // Pas de presse-papier, pas de clavier, pas de dispatch d'événement :
                // la face publique documentée.
                if (!actions) { setErreur('inputActions absent : ce bouton n\'est pas dans un emplacement de portée session'); return }
                actions.setDraft(texte)
                actions.submit()
              })
              .catch(function (e) { setPhase('repos'); setErreur('transcription : ' + String((e && e.message) || e)) })
          }
          r.start()
          setPhase('ecoute')
        }).catch(function (e) {
          setErreur('micro refusé ou indisponible : ' + String((e && e.name) || e))
          setPhase('repos')
        })
      }

      var style = Object.assign({}, STYLES.bouton, phase === 'ecoute' ? STYLES.actif : null, phase === 'occupe' ? STYLES.occupe : null)
      var libelle = phase === 'ecoute' ? '● écoute' : (phase === 'occupe' ? '…' : '🎙')

      return h('span', { style: { position: 'relative', display: 'inline-flex' } },
        h('button', {
          type: 'button',
          style: style,
          title: "Maintenir pour dicter — le micro de la PAGE, donc indépendant du focus",
          'aria-label': 'Dicter',
          'aria-pressed': phase === 'ecoute',
          // Appui maintenu : c'est la « gate ». On relâche, la phrase part.
          onPointerDown: function () { if (phase === 'repos') demarrer() },
          onPointerUp: arreter,
          onPointerLeave: function () { if (phase === 'ecoute') arreter() },
          onKeyDown: function (e) {
            if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (phase === 'repos') demarrer() }
          },
          onKeyUp: function (e) { if (e.key === ' ' || e.key === 'Enter') arreter() },
          disabled: phase === 'occupe',
        }, libelle),
        erreur ? h('span', { style: STYLES.erreur, role: 'alert' }, erreur) : null,
      )
    }

    /**
     * Montage du greffon côté navigateur.
     *
     * L'emplacement visé est « conversation.input.right » —
     *   « Compact controls before the composer submit action », kind: 'list', scope: 'session'
     *   dsh-client-ui-conversation/…/contract/slots.d.ts l. 207-211
     *
     * Et c'est CE choix de portée (`session`) qui donne accès à `inputActions`.
     */
    function apply(ctx) {
      var enregistrer = function () {
        return ctx.slots.register(
          { name: 'conversation.input.right', id: 'voix-locale', order: 50 },
          BoutonMicro,
        )
      }
      // inject(...) et non register(...) : l'emplacement appartient à ui-conversation,
      // il peut être démonté et remonté. Voir docs/subsystems/slots.md l. 17.
      ctx.slots.inject('conversation.input.right', enregistrer)
    }

    exports.apply = apply

    // ⚠️ POINT NON VÉRIFIÉ N° 2 — le nom du service.
    // L'exemple de docs/subsystems/slots.md l. 32-40 écrit `export const inject = ['slots']`.
    // C'est la valeur reprise ici, telle quelle. Si le greffon ne s'active pas,
    // c'est le deuxième caractère à regarder — après React.
    exports.inject = ['slots']

    return module.exports
  },
})
