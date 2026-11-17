#!/bin/bash
# mapurls.sh <port>: the map with every incomplete set of runes we compare, at two places, by day and at night.
P=$1
L1="langkaia,akershus,radhuset,slottet,holmenkollen,akerselva,nordmarka,stortinget,ekeberg,nabolaget"
L2a="bygdoy,vigelandsparken,korketrekkeren,ostensjovannet,bjorvika"
for c in "" "&cleared=langkaia,akershus,radhuset" "&cleared=$L1" "&cleared=$L1,$L2a" "&cleared=akershus,radhuset,slottet,holmenkollen,akerselva,nordmarka,stortinget,ekeberg,nabolaget,$L2a,gamlebyen"; do
  for x in "" "&x=1528"; do
    for sky in day night; do
      echo "http://localhost:$P/viking/?debug&told&steps=30&sky=$sky$c$x#kart"
    done
  done
done
