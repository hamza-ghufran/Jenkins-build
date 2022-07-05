git add .
git commit -m "test"
if [ -n "$(git status)" ];
then
 echo "IT IS CLEAN"
else
 git status
 echo "Pushing data to remote server!!!"
 git push
fi