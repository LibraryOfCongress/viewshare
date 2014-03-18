EXCLUSIONS="\
testall.sh \
"

for f in *; do
    echo $EXCLUSIONS | grep $f > /dev/null 2>&1
    if [ "$?" -eq "0" ]; then
        echo "Skipped " $f;
    else
        echo $f;
        time curl --request POST --data-binary "@-" "http://localhost:8880/augment.freemix.json" < $f | head
    fi
done

