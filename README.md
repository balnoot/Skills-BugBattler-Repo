Dit is de SKills Heroes SOftware developer 2025-2026 Noah bugbattler opdracht

mango: CLI-tool voor bugreports wat bug meldingen beheert.

mango add       Een nieuwe bug toevoegen
mango list      Alle bug reports bekijken
mango filter    Bug reports filteren
mango help      Helptekst bekijken

gemaakt met node.js npm link om te update en gwn mango command om te starten hierbij krijg je help tekst en logo enzo

daarna kan je met bijv mango add ... iets toevoegen. zie hieronder voor meer uitleg


hier onder vind je voorbeelden om de CLI mee te testen:

#.add  report
mango add --title "bug werkt niet" -- description "het werkt niet" --priority high --status open

#.alles tonen
mango list

#.filteren
mango filter --status closed (optioneel) --priority medium

