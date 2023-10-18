

# Release process

## 0 step

	Add changes to Changelog.md file

## 1st step

increase version of package.json file

## 2nd step

commands:
	>> tag = "version of package file"
	>> git add -A
	>> git commit -m "message"
	>> git tag ${tag}
	>> git push origin ${tag}

## 3rd step

launch release:
	>> gh release create ${tag}
