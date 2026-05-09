"use client";

import { useEffect } from "react";
import Script from "next/script";

// Base64 logo is inlined in the HTML to match the original landing page.
// It was exported from the original index.html as-is.
const LOGO_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAB9fElEQVR4nO2dd7wlRZmwnwodTrhp8sCQEVBEkQUxggpKcBcU86prjuvuyq660eyaXXME02dGRAmCuApIkCCSRXIYGJh45957Uqeq74/qPufcO3cCgi4M9fBrzp1z+vTprq56+6233gAej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Ho/H4/F4PB6Px+PxeDwej8fj8Xg8Hs+fjPi/PoGHLnKe9wwwu9HsX+RcZvN//ft/OebeA/On7b+lXv5nbkBxv39i+BpmX6+YZz+71TbZvtD/1yfwl0RKidaaPM8xxqC1psjzWftYJEIIbNVxrOtuw53FfWL6/3/AfV6AFIOfs/MccNPfZyu/X+4lhDugtCil+p8WeT74zM4nnLcVs0V5IBDYzZyhdTts5nsKgcLYTR8Hw78dhRFJmiBQWAQWgdYag8GYHCg2L7BseWAr2bJwmK+Nq/Y1s3aY+73hI/ePMWcnYYf33lToaqXJi5xQaYqiwCLQFNfII0toPSI0rCAIAMiybJNPKkGBFVgBg46oAIE1rku43Uy/OwkM1v3tAQksIcBspr9JKXFm/oE070CY/JNPKdVDRgHLJcjswXbGJ93h413GfuvcBKGGPAzH1ivgi8dHW+KpKD49v28VWLeG3Y0mu/S6sqPYjBzMpR5u7z6gt88PyQzCu/pc9goAIDj46P+77ZtYQ2BOC0Senup6wBnHQwMPBFlhuj16zMYI7PCnxoqsN6Bj74IDd28Ef3yy5nE6HZAvxQ7JbXsj3/NXz2ZUUFEORF5Iqr875tf/oeXb9hAkuYRAEO8VxDz78WwLNjoy5SojxnexzCiNznGJmpd29d6iaTp4K7Yya0UIbZrztgcw+32SuXpAkmx0SUhZC1hLMEaEdL1qIUM5A0MWzIw2ChFDBh1HgbJLYAPIcoN6FWDidQgGmc/EOB2avqim+owILbnvZltGXfZON/YLAIzbeDXxWJMEFo9eNm2XlemvNdXdA3G/v7XyvsgmuyGGzup+TxNvce9nCdPQIxncQwho2xbee9R1zd99+3WZUYBO0v45qQDBi1Jep1B21WHs3M1mc0NeMPm26Z8Xwq33yyBZRB9rW3wOuvhVp6LKPd1AnDOZF8YrHX9IIoVaa8gCBROHmsKU5TCygus7YZqCghOaBVzBIHot0D5JK261CZax+ypydY1nG1FznmtTseWGslmtIq+Zri5E3BnqJQiCBS9XkoQCvLUotScqedc9eF+YLZy9Vo7q4O1tv/AAPpCpSgs1tpy/A7aQCCRUpTa0pxBOfwMsRAEkGYghEAQYAYXhhBF/2/3RScQ3RTSIKUYCLR5BNRsgTv7cwuD+zOnGeafUpbfF2ZW/xpc+1zrpOu3QkIca7rdIfOFlWV/3nTWsD2z3QusCikl1tp+B9RaI4SYdcOH+6a1D07jiC0dxAqEUIhyXmQBY/PZg2RYO5h1YGYLqy0MmMpUFUWSLBkM/DCENN3y+cutNEJut11gV20xfHlaBlgrkBaskBR2IGCUVOSVwBLzCywloSgAC/V6nV4nw5bflRKyPHHXMbgiBlMvM1tDGZoCzn8Bsz+3YtPd+7PP6rk31DrztZOYdXbDwtAJJxlANcONa5BlUBiggCiOSbrzzRK2Xx4RAisIAjfNKg3tSinSNO0Lhvkaod+FNjcjKHuf2cpoFdX/7Dyvs/dyGpWoJhVOuNrKyGEZnKgYOsZm1Lxq1yBQZFlBoJytTCknhOaa8zadwGzbq5BbnpBUNrpKSCkFSgmkdEI67eW4qZxECoW1lrwUIlJIClsKlPkENhBGkrRnkOXvCCRhEDrjtMn6TTVbn3FCy513tqmM2tw9nbOfAaSec2vK78pKYNmhmy02bSvZ/63ZursRtr+/Uu5+CVXZDRk8rLbvZeJN2O5XCaupR2VwN8aQ5zlBELDHHrvZLO0JOTTyBQYhLBJrhaVvY7ECgRUYURlb3asbd5sf0kIou/nPoUgL0e12abVaZFnR79C5ccKwvwo4a7DIoY66ZfuFyQpqoWKfvfeya9euFlEcEAfapmkqglBbgXTTTyOwctNXCuZ9Xxi3SFH0T2T+6+90eiJJuvR6KXnu7GZFYclSp0HUY02vlyMwGJvPWicTQoCdc31zhEZaaoxxHNPp9BDlvbQmY3y0QZZ0AMssU5vt/69/vLlCy4jqHMqrm/tAKJWtzJTfrT4Xs17uh6peSbjZq5q5gVoEmYa8gHo9YOPGjLGxUVqtDkWWz3+47ZRHhIZVrU4ppfrC69BDD7XHv/0fsUWKIAcMSoCwBoFBYUHY0ghcaj3CGUetGLyHzQc2iXleBWqLnwcyJE1Ter0enU6Htes3cPPNN3P1Nddy++23izXru1igmCuw+rYQGDb69q95aM/DDz/U/vu//htp1iEOQozJ6SVd6vWYIk+pjMRWbPoqUfO+714ZuEps5vqsEeRFSprkJGmXmek2q9fcy8q77mHt2rX8/sprmJycEhs3dinK864mhULMmXL222CwoFDO7JBSYXKD1oubdoKCKAjJs5Qliyb47w++zzYbIcIOppTSSgwSWUoZpZ2AM0PHniW8qvs4q30N0jqhJrUa7D9sl6pWH4dtAmLuw8UMfT70IBSDeWzuVZCmDWSq5cyNchsV9vOSI3rPiM3rCA5YB3RaE8TxrOfVPupD/IxAwMsRnS6BjAiCv7WFjBwMLAw8HB7DU6fPrZA1q36MP3ObTgUANIU/fx/IZjMp2PJ6wyQzTLiRoADQ85vpoOCDBgeAQyIDgADgTCciWuG2yAH39awBiieUn09FH5QYXXs6+eoA5xNeVZ9lFnSvd16pzks+KNDUDTtQgIWHdrdOim+95u89tHQQXWDdkeuZh+61MnbeTvHi9IQfE/QwZknCQQJwBkQcbAEpA7h9w4eAQs9xgq/fzLa3QBaOKqVm3bIoQA738/VaKqDBlDBAesW2B+WIlzo0mZpQzKohQtgQM6buGdBdACMg90XqHpugALFsRzJ9adM29Wfa32Y9a/5977wefVwWUZZyEpLPzkp6dx6+13EAWhe+hIhdYKDVuNY90e8QJrGxh2+DTGiC3leLq/mLLXVQqJGLoj7XbKeeddKq666iqyLCMIAur1erniKcjzHCEET3zigc4QXI4Lay2yTFo4m2rpctOB9ach+gLFUuV0Ggx5yhAYaavX2ZsoV92ENbiAmU23gTAor0CUG25lM0m71GsRr3/ta3j2YQfbOHAalhLSaTvKebBffPEl3HrretK0VJjM1hLjPDS47rq7xQ1/uJEoqpFn1Q0WbhHnkaZe4QXW/aJyAHwwBRYMNJMqq4HSEq3cKlocC0449TSKwhKGMVqHKOWEUVEUdLtd9tprL/rJRAVAUWaZqAb6n3P5e66ONaxrzX2dzcBR4gG0Z2EIlKTb6/CRj/43z372IdYCY2Mj/fxnOgw59dRTWbBAO8EuIDWG4ZXOhwT9fmWcbdS6XF+XX/47p/ELRa3WQAhBZofiOB9BPITu1kOXyqt7OAGdeNCsBy7VSt+r3EKRG4rCddgss/zhD7eIVatWYa1lcsMUUiqCIHKhQUKwYqcdGR+XSOlSkQCbLDD8uehrVnb+TfQ3NrNZN72zdosb/VwqA6EogSjQtKY3QpHTntnIW978OpYs0ISRJkm6FEXBunXruOnGlWL9hhwdCvp+tkJsTpb+H1BOC+3s+2YtXHjhRaLbTQjD2MWd1t0iS5Y/8oKfvcC6n1T+Qg/m8Ywxg9i9aopVPmyLwo3TZASqRV5VmxRYAm5hc8AY/Jt6kRSlA8Ca/tCyFI285zztkZQ3gwqHaVqf2a9Dh9fo1RAYSyFKcqvmnKzw4dyVMcvr3328cuvCNvfz865yFkPNGE2EVjz6UnzCmg7/JYE1NDehnotptPt9D91wssg0CipSE3iBdb2iFIKYwzWWsIwREpJr9ebZ08561UMN5EwZd8fCK5is/rDtiFLgSCEcn8LQVEUmKKYveOcJ/k2HLl8NX3BF4aaNM0JI0mWGSe77PC+9x8htnxCdj51sTrDTQSydG1gZSnUhiWMYRNBJZxMqdUCOt0MkAg0UrrjSC1Jep1B21WHs3M1mc0NeMPm26Z8Xwq33yyBZRB9rW3wOuvhVp6LKPd1AnDOZF8YrHX9IIoVaa8gCBROHmsKU5TCygus7YZqCghOaBVzBIHot0D5JK261CZax+ypydY1nG1FznmtTseWGslmtIq+Zri5E3BnqJQiCBS9XkoQCvLUotScqedc9eF+YLZy9Vo7q4O1tv/AAPpCpSgs1tpy/A7aQCCRUpTa0pxBOfwMsRAEkGYghEAQYAYXhhBF/2/3RScQ3RTSIKUYCLR5BNRsgTv7cwuD+zOnGeafUpbfF2ZW/xpc+1zrpOu3QkIca7rdIfOFlWV/3nTWsD2z3QusCikl1tp+B9RaI4SYdcOH+6a1D07jiC0dxAqEUIhyXmQBY/PZg2RYO5h1YGYLqy0MmMpUFUWSLBkM/DCENN3y+cutNEJut11gV20xfHlaBlgrkBaskBR2IGCUVOSVwBLzCywloSgAC/V6nV4nw5bflRKyPHHXMbgiBlMvM1tDGZoCzn8Bsz+3YtPd+7PP6rk31DrztZOYdXbDwtAJJxlANcONa5BlUBiggCiOSbrzzRK2Xx4RAisIAjfNKg3tSinSNO0Lhvkaod+FNjcjKHuf2cpoFdX/7Dyvs/dyGpWoJhVOuNrKyGEZnKgYOsZm1Lxq1yBQZFlBoJytTCknhOaa8zadwGzbq5BbnpBUNrpKSCkFSgmkdEI67eW4qZxECoW1lrwUIlJIClsKlPkENhBGkrRnkOXvCCRhEDrjtMn6TTVbn3FCy513tqmM2tw9nbOfAaSec2vK78pKYNmhmy02bSvZ/63ZursRtr+/Uu5+CVXZDRk8rLbvZeJN2O5XCaupR2VwN8aQ5zlBELDHHrvZLO0JOTTyBQYhLBJrhaVvY7ECgRUYURlb3asbd5sf0kIou/nPoUgL0e12abVaZFnR79C5ccKwvwo4a7DIoY66ZfuFyQpqoWKfvfeya9euFlEcEAfapmkqglBbgXTTTyOwctNXCuZ9Xxi3SFH0T2T+6+90eiJJuvR6KXnu7GZFYclSp0HUY02vlyMwGJvPWicTQoCdc31zhEZaaoxxHNPp9BDlvbQmY3y0QZZ0AMssU5vt/69/vLlCy4jqHMqrm/tAKJWtzJTfrT4Xs17uh6peSbjZq5q5gVoEmYa8gHo9YOPGjLGxUVqtDkWWz3+47ZRHhIZVrU4ppfrC69BDD7XHv/0fsUWKIAcMSoCwBoFBYUHY0ghcaj3CGUetGLyHzQc2iXleBWqLnwcyJE1Ter0enU6Htes3cPPNN3P1Nddy++23izXru1igmCuw+rYQGDb69q95aM/DDz/U/vu//htp1iEOQozJ6SVd6vWYIk+pjMRWbPoqUfO+714ZuEps5vqsEeRFSprkJGmXmek2q9fcy8q77mHt2rX8/sprmJycEhs3dinK864mhULMmXL222CwoFDO7JBSYXKD1oubdoKCKAjJs5Qliyb47w++zzYbIcIOppTSSgwSWUoZpZ2AM0PHniW8qvs4q30N0jqhJrUa7D9sl6pWH4dtAmLuw8UMfT70IBSDeWzuVZCmDWSq5cyNchsV9vOSI3rPiM3rCA5YB3RaE8TxrOfVPupD/IxAwMsRnS6BjAiCv7WFjBwMLAw8HB7DU6fPrZA1q36MP3ObTgUANIU/fx/IZjMp2PJ6wyQzTLiRoADQ85vpoOCDBgeAQyIDgADgTCciWuG2yAH39awBiieUn09FH5QYXXs6+eoA5xNeVZ9lFnSvd16pzks+KNDUDTtQgIWHdrdOim+95u89tHQQXWDdkeuZh+61MnbeTvHi9IQfE/QwZknCQQJwBkQcbAEpA7h9w4eAQs9xgq/fzLa3QBaOKqVm3bIoQA738/VaKqDBlDBAesW2B+WIlzo0mZpQzKohQtgQM6buGdBdACMg90XqHpugALFsRzJ9adM29Wfa32Y9a/5977wefVwWUZZyEpLPzkp6dx6+13EAWhe+hIhdYKDVuNY90e8QJrGxh2+DTGiC3leLq/mLLXVQqJGLoj7XbKeeddKq666iqyLCMIAur1erniKcjzHCEET3zigc4QXI4Lay2yTFo4m2rpctOB9ach+gLFUuV0Ggx5yhAYaavX2ZsoV92ENbiAmU23gTAor0CUG25lM0m71GsRr3/ta3j2YQfbOHAalhLSaTvKebBffPEl3HrretK0VJjM1hLjPDS47rq7xQ1/uJEoqpFn1Q0WbhHnkaZe4QXW/aJyAHwwBRYMNJMqq4HSEq3cKlocC0449TSKwhKGMVqHKOWEUVEUdLtd9tprL/rJRAVAUWaZqAb6n3P5e66ONaxrzX2dzcBR4gG0Z2EIlKTb6/CRj/43z372IdYCY2Mj/fxnOgw59dRTWbBAO8EuIDWG4ZXOhwT9fmWcbdS6XF+XX/47p/ELRa3WQAhBZofiOB9BPITu1kOXyqt7OAGdeNCsBy7VSt+r3EKRG4rCddgss/zhD7eIVatWYa1lcsMUUiqCIHKhQUKwYqcdGR+XSOlSkQCbLDD8uehrVnb+TfQ3NrNZN72zdosb/VwqA6EogSjQtKY3QpHTntnIW978OpYs0ISRJkm6FEXBunXruOnGlWL9hhwdCvp+tkJsTpb+H1BOC+3s+2YtXHjhRaLbTQjD2MWd1t0iS5Y/8oKfvcC6n1T+Qg/m8Ywxg9i9aopVPmyLwo3TZASqRV5VmxRYAm5hc8AY/Jt6kRSlA8Ca/tCyFI285zztkZQ3gwqHaVqf2a9Dh9fo1RAYSyFKcqvmnKzw4dyVMcvr3328cuvCNvfz865yFkPNGE2EVjz6UnzCmg7/JYE1NDehnotptPt9D91wssg0CipSE3iBdb2iFIKYwzWWsIwREpJr9ebZ08561UMN5EwZd8fCK5is/rDtiFLgSCEcn8LQVEUmKKYveOcJ/k2HLl8NX3BF4aaNM0JI0mWGSe77PC+9x8htnxCdj51sTrDTQSydG1gZSnUhiWMYRNBJZxMqdUCOt0MkAg0UrrjSC1Jep1B21WHs3M1mc0NeMPm26Z8Xwq33yyBZRB9rW3wOuvhVp6LKPd1AnDOZF8YrHX9IIoVaa8gCBROHmsKU5TCygus7YZqCghOaBVzBIHot0D5JK261CZax+ypydY1nG1FznmtTseWGslmtIq+Zri5E3BnqJQiCBS9XkoQCvLUotScqedc9eF+YLZy9Vo7q4O1tv/AAPpCpSgs1tpy/A7aQCCRUpTa0pxBOfwMsRAEkGYghEAQYAYXhhBF/2/3RScQ3RTSIKUYCLR5BNRsgTv7cwuD+zOnGeafUpbfF2ZW/xpc+1zrpOu3QkIca7rdIfOFlWV/3nTWsD2z3QusCikl1tp+B9RaI4SYdcOH+6a1D07jiC0dxAqEUIhyXmQBY/PZg2RYO5h1YGYLqy0MmMpUFUWSLBkM/DCENN3y+cutNEJut11gV20xfHlaBlgrkBaskBR2IGCUVOSVwBLzCywloSgAC/V6nV4nw5bflRKyPHHXMbgiBlMvM1tDGZoCzn8Bsz+3YtPd+7PP6rk31DrztZOYdXbDwtAJJxlANcONa5BlUBiggCiOSbrzzRK2Xx4RAisIAjfNKg3tSinSNO0Lhvkaod+FNjcjKHuf2cpoFdX/7Dyvs/dyGpWoJhVOuNrKyGEZnKgYOsZm1Lxq1yBQZFlBoJytTCknhOaa8zadwGzbq5BbnpBUNrpKSCkFSgmkdEI67eW4qZxECoW1lrwUIlJIClsKlPkENhBGkrRnkOXvCCRhEDrjtMn6TTVbn3FCy513tqmM2tw9nbOfAaSec2vK78pKYNmhmy02bSvZ/63ZursRtr+/Uu5+CVXZDRk8rLbvZeJN2O5XCaupR2VwN8aQ5zlBELDHHrvZLO0JOTTyBQYhLBJrhaVvY7ECgRUYURlb3asbd5sf0kIou/nPoUgL0e12abVaZFnR79C5ccKwvwo4a7DIoY66ZfuFyQpqoWKfvfeya9euFlEcEAfapmkqglBbgXTTTyOwctNXCuZ9Xxi3SFH0T2T+6+90eiJJuvR6KXnu7GZFYclSp0HUY02vlyMwGJvPWicTQoCdc31zhEZaaoxxHNPp9BDlvbQmY3y0QZZ0AMssU5vt/69/vLlCy4jqHMqrm/tAKJWtzJTfrT4Xs17uh6peSbjZq5q5gVoEmYa8gHo9YOPGjLGxUVqtDkWWz3+47ZRHhIZVrU4ppfrC69BDD7XHv/0fsUWKIAcMSoCwBoFBYUHY0ghcaj3CGUetGLyHzQc2iXleBWqLnwcyJE1Ter0enU6Htes3cPPNN3P1Nddy++23izXru1igmCuw+rYQGDb69q95aM/DDz/U/vu//htp1iEOQozJ6SVd6vWYIk+pjMRWbPoqUfO+714ZuEps5vqsEeRFSprkJGmXmek2q9fcy8q77mHt2rX8/sprmJycEhs3dinK864mhULMmXL222CwoFDO7JBSYXKD1oubdoKCKAjJs5Qliyb47w++zzYbIcIOppTSSgwSWUoZpZ2AM0PHniW8qvs4q30N0jqhJrUa7D9sl6pWH4dtAmLuw8UMfT70IBSDeWzuVZCmDWSq5cyNchsV9vOSI3rPiM3rCA5YB3RaE8TxrOfVPupD/IxAwMsRnS6BjAiCv7WFjBwMLAw8HB7DU6fPrZA1q36MP3ObTgUANIU/fx/IZjMp2PJ6wyQzTLiRoADQ85vpoOCDBgeAQyIDgADgTCciWuG2yAH39awBiieUn09FH5QYXXs6+eoA5xNeVZ9lFnSvd16pzks+KNDUDTtQgIWHdrdOim+95u89tHQQXWDdkeuZh+61MnbeTvHi9IQfE/QwZknCQQJwBkQcbAEpA7h9w4eAQs9xgq/fzLa3QBaOKqVm3bIoQA738/VaKqDBlDBAesW2B+WIlzo0mZpQzKohQtgQM6buGdBdACMg90XqHpugALFsRzJ9adM29Wfa32Y9a/5977wefVwWUZZyEpLPzkp6dx6+13EAWhe+hIhdYKDVuNY90e8QJrGxh2+DTGiC3leLq/mLLXVQqJGLoj7XbKeeddKq666iqyLCMIAur1erniKcjzHCEET3zigc4QXI4Lay2yTFo4m2rpctOB9ach+gLFUuV0Ggx5yhAYaavX2ZsoV92ENbiAmU23gTAor0CUG25lM0m71GsRr3/ta3j2YQfbOHAalhLSaTvKebBffPEl3HrretK0VJjM1hLjPDS47rq7xQ1/uJEoqpFn1Q0WbhHnkaZe4QXW/aJyAHwwBRYMNJMqq4HSEq3cKlocC0449TSKwhKGMVqHKOWEUVEUdLtd9tprL/rJRAVAUWaZqAb6n3P5e66ONaxrzX2dzcBR4gG0Z2EIlKTb6/CRj/43z372IdYCY2Mj/fxnOgw59dRTWbBAO8EuIDWG4ZXOhwT9fmWcbdS6XF+XX/47p/ELRa3WQAhBZofiOB9BPITu1kOXyqt7OAGdeNCsBy7VSt+r3EKRG4rCddgss/zhD7eIVatWYa1lcsMUUiqCIHKhQUKwYqcdGR+XSOlSkQCbLDD8uehrVnb+TfQ3NrNZN72zdosb/VwqA6EogSjQtKY3QpHTntnIW978OpYs0ISRJkm6FEXBunXruOnGlWL9hhwdCvp+tkJsTpb+H1BOC+3s+2YtXHjhRaLbTQjD2MWd1t0iS5Y/8oKfvcC6n1T+Qg/m8Ywxg9i9aopVPmyLwo3TZASqRV5VmxRYAm5hc8AY/Jt6kRSlA8Ca/tCyFI285zztkZQ3gwqHaVqf2a9Dh9fo1RAYSyFKcqvmnKzw4dyVMcvr3328cuvCNvfz865yFkPNGE2EVjz6UnzCmg7/JYE1NDehnotptPt9D91wssg0CipSE3iBdb2iFIKYwzWWsIwREpJr9ebZ08561UMN5EwZd8fCK5is/rDtiFLgSCEcn8LQVEUmKKYveOcJ/k2HLl8NX3BF4aaNM0JI0mWGSe77PC+9x8htnxCdj51sTrDTQSydG1gZSnUhiWMYRNBJZxMqdUCOt0MkAg0UrrjSC1Jep1B21WHs3M1mc0NeMPm26Z8Xwq33yyBZRB9rW3wOuvhVp6LKPd1AnDOZF8YrHX9IIoVaa8gCBROHmsKU5TCygus7YZqCghOaBVzBIHot0D5JK261CZax+ypydY1nG1FznmtTseWGslmtIq+Zri5E3BnqJQiCBS9XkoQCvLUotScqedc9eF+YLZy9Vo7q4O1tv/AAPpCpSgs1tpy/A7aQCCRUpTa0pxBOfwMsRAEkGYghEAQYAYXhhBF/2/3RScQ3RTSIKUYCLR5BNRsgTv7cwuD+zOnGeafUpbfF2ZW/xpc+1zrpOu3QkIca7rdIfOFlWV/3nTWsD2z3QusCikl1tp+B9RaI4SYdcOH+6a1D07jiC0dxAqEUIhyXmQBY/PZg2RYO5h1YGYLqy0MmMpUFUWSLBkM/DCENN3y+cutNEJut11gV20xfHlaBlgrkBaskBR2IGCUVOSVwBLzCywloSgAC/V6nV4nw5bflRKyPHHXMbgiBlMvM1tDGZoCzn8Bsz+3YtPd+7PP6rk31DrztZOYdXbDwtAJJxlANcONa5BlUBiggCiOSbrzzRK2Xx4RAisIAjfNKg3tSinSNO0Lhvkaod+FNjcjKHuf2cpoFdX/7Dyvs/dyGpWoJhVOuNrKyGEZnKgYOsZm1Lxq1yBQZFlBoJytTCknhOaa8zadwGzbq5BbnpBUNrpKSCkFSgmkdEI67eW4qZxECoW1lrwUIlJIClsKlPkENhBGkrRnkOXvCCRhEDrjtMn6TTVbn3FCy513tqmM2tw9nbOfAaSec2vK78pKYNmhmy02bSvZ/63ZursRtr+/Uu5+CVXZDRk8rLbvZeJN2O5XCaupR2VwN8aQ5zlBELDHHrvZLO0JOTTyBQYhLBJrhaVvY7ECgRUYURlb3asbd5sf0kIou/nPoUgL0e12abVaZFnR79C5ccKwvwo4a7DIoY66ZfuFyQpqoWKfvfeya9euFlEcEAfapmkqglBbgXTTTyOwctNXCuZ9Xxi3SFH0T2T+6+90eiJJuvR6KXnu7GZFYclSp0HUY02vlyMwGJvPWicTQoCdc31zhEZaaoxxHNPp9BDlvbQmY3y0QZZ0AMssU5vt/69/vLlCy4jqHMqrm/tAKJWtzJTfrT4Xs17uh6peSbjZq5q5gVoEmYa8gHo9YOPGjLGxUVqtDkWWz3+47ZRHhIZVrU4ppfrC69BDD7XHv/0fsUWKIAcMSoCwBoFBYUHY0ghcaj3CGUetGLyHzQc2iXleBWqLnwcyJE1Ter0enU6Htes3cPPNN3P1Nddy++23izXru1igmCuw+rYQGDb69q95aM/DDz/U/vu//htp1iEOQozJ6SVd6vWYIk+pjMRWbPoqUfO+714ZuEps5vqsEeRFSprkJGmXmek2q9fcy8q77mHt2rX8/sprmJycEhs3dinK864mhULMmXL222CwoFDO7JBSYXKD1oubdoKCKAjJs5Qliyb47w++zzYbIcIOppTSSgwSWUoZpZ2AM0PHniW8qvs4q30N0jqhJrUa7D9sl6pWH4dtAmLuw8UMfT70IBSD";

export function LandingPage() {
  useEffect(() => {
    // Navbar scroll effect
    const navbar = document.getElementById("navbar");
    const handleScroll = () => {
      navbar?.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Intersection Observer for fade-up animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  function toggleMobile() {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    hamburger?.classList.toggle("open");
    mobileMenu?.classList.toggle("open");
    document.body.style.overflow = mobileMenu?.classList.contains("open")
      ? "hidden"
      : "";
  }

  function closeMobile() {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    hamburger?.classList.remove("open");
    mobileMenu?.classList.remove("open");
    document.body.style.overflow = "";
  }

  return (
    <>
      {/* NAVIGATION */}
      <nav id="navbar">
        <div className="nav-inner">
          <a href="/admin/login" className="nav-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="Real Deal Talent" className="nav-logo-img" />
          </a>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#industries">Industries</a></li>
            <li><a href="#specialties">Specialties</a></li>
            <li><a href="#placements">Track Record</a></li>
            <li><a href="#contact" className="nav-cta">Let&apos;s Talk</a></li>
          </ul>
          <button className="hamburger" id="hamburger" aria-label="Menu" onClick={toggleMobile}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className="mobile-menu" id="mobileMenu">
        <a href="#about" onClick={closeMobile}>About</a>
        <a href="#industries" onClick={closeMobile}>Industries</a>
        <a href="#specialties" onClick={closeMobile}>Specialties</a>
        <a href="#placements" onClick={closeMobile}>Track Record</a>
        <a href="#contact" onClick={closeMobile}>Let&apos;s Talk</a>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text fade-up">
              <h1>Your next <em>game-changing</em> hire starts here.</h1>
              <p>Real Deal Talent places Sales &amp; Operations professionals with Industrial Services, Heavy Equipment, Manufacturing &amp; Distribution companies across the US &amp; Canada. No fluff. No runaround. Just results.</p>
              <div className="hero-buttons">
                <a href="#contact" className="btn-primary">
                  Start a Search
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
                <a href="#placements" className="btn-secondary">See Our Track Record</a>
              </div>
            </div>
            <div className="hero-visual fade-up" style={{ transitionDelay: "0.15s" }}>
              <div className="hero-card">
                <div className="hero-stat">
                  <div className="hero-stat-number">9+</div>
                  <div className="hero-stat-label">Years of headhunting in industrial markets</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-number">50+</div>
                  <div className="hero-stat-label">Placements across Sales &amp; Operations</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-number">US &amp; CA</div>
                  <div className="hero-stat-label">Nationwide reach, coast to coast</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="fade-up">
              <div className="section-label">About Real Deal Talent</div>
              <h2 className="section-title">An honest headhunter who bet on himself.</h2>
              <p className="section-subtitle">After eight years in the agency recruiting world placing talent across Wall Street, Oil &amp; Gas, Industrial Services, IIoT, and SaaS, I decided to go all in on my own. I launched Real Deal Talent in February 2025 because I saw a gap in the market for a recruiter who actually knows these industries &mdash; not just the buzzwords, but the people, the roles, and what it takes to build winning teams.</p>
              <p className="about-quote">Every client and candidate who&apos;s ever worked with me comes to the same conclusion &mdash; I&apos;m the best recruiter they&apos;ve ever dealt with.</p>
            </div>
            <div className="about-visual fade-up" style={{ transitionDelay: "0.1s" }}>
              <ul className="about-values">
                <li>
                  <span className="value-number">01</span>
                  <div>
                    <div className="value-title">No Fluff, Just Results</div>
                    <div className="value-desc">I don&apos;t send you a stack of resumes and hope for the best. I send you the right candidate, vetted and ready.</div>
                  </div>
                </li>
                <li>
                  <span className="value-number">02</span>
                  <div>
                    <div className="value-title">Deep Industry Knowledge</div>
                    <div className="value-desc">NDT, SIPA, ILI, TICC, pipeline integrity, heavy equipment &mdash; I speak the language because I&apos;ve lived in these spaces for nearly a decade.</div>
                  </div>
                </li>
                <li>
                  <span className="value-number">03</span>
                  <div>
                    <div className="value-title">PE-Backed &amp; Public Companies</div>
                    <div className="value-desc">Strong track record building out Sales &amp; Operations teams for privately-held, PE-backed, and publicly-traded companies.</div>
                  </div>
                </li>
                <li>
                  <span className="value-number">04</span>
                  <div>
                    <div className="value-title">Relationships Over Transactions</div>
                    <div className="value-desc">I&apos;m in this for the long haul. My clients become repeat clients because I deliver every single time.</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="industries" id="industries">
        <div className="container">
          <div className="fade-up">
            <div className="section-label">Industries We Serve</div>
            <h2 className="section-title" style={{ color: "var(--paper)" }}>Built for the toughest industries.</h2>
            <p className="section-subtitle">We recruit where the work is hard, the stakes are high, and the right hire makes all the difference.</p>
          </div>
          <div className="industry-grid">
            <div className="industry-card fade-up">
              <div className="industry-icon"><svg viewBox="0 0 24 24"><path d="M2 20h20M5 20V8l7-5 7 5v12M9 20v-6h6v6"/></svg></div>
              <h3>SIPA Contractors</h3>
              <p>Scaffolding, insulation, painting, and abatement services. Companies like BrandSafway, Brock Group, and specialty access providers.</p>
            </div>
            <div className="industry-card fade-up" style={{ transitionDelay: "0.08s" }}>
              <div className="industry-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
              <h3>TICC Contractors</h3>
              <p>Testing, inspection, certification, and compliance. Working with leaders like Mistras Group, Acuren, SGS, Bureau Veritas, Intertek, and more.</p>
            </div>
            <div className="industry-card fade-up" style={{ transitionDelay: "0.16s" }}>
              <div className="industry-icon"><svg viewBox="0 0 24 24"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20M14 12h.01"/></svg></div>
              <h3>Heavy Equipment</h3>
              <p>Equipment rental, sales, and service. Earthmoving, aerial platforms, telehandlers, concrete, and general jobsite machines.</p>
            </div>
            <div className="industry-card fade-up" style={{ transitionDelay: "0.24s" }}>
              <div className="industry-icon"><svg viewBox="0 0 24 24"><path d="M20 7h-9M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg></div>
              <h3>Master Distribution</h3>
              <p>Electrical hardware, components, power utility products. Serving wholesalers, distributors, OEMs, municipalities, and end-users.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="specialties" id="specialties">
        <div className="container">
          <div className="fade-up">
            <div className="section-label">What We Recruit</div>
            <h2 className="section-title">Sales &amp; Operations. That&apos;s our lane.</h2>
            <p className="section-subtitle">We stay focused so we can stay the best at what we do.</p>
          </div>
          <div className="spec-grid">
            <div className="spec-card fade-up">
              <h3>Sales Talent</h3>
              <p>From boots-on-the-ground territory reps to the VP building the entire go-to-market strategy, we find revenue-driving talent that fits your culture and hits the ground running.</p>
              <div className="spec-roles">
                <span>Outside Sales Reps</span><span>Account Managers</span><span>BD Managers</span><span>Territory Sales Managers</span><span>Regional Sales Managers</span><span>Directors of Sales</span><span>VPs of Sales</span><span>Strategic Account Managers</span>
              </div>
            </div>
            <div className="spec-card fade-up" style={{ transitionDelay: "0.1s" }}>
              <h3>Operations Talent</h3>
              <p>The people who keep the machine running. We place operational leaders who manage teams, hit KPIs, and drive growth from the front lines to the C-suite.</p>
              <div className="spec-roles">
                <span>Operations Managers</span><span>Branch Managers</span><span>General Managers</span><span>Regional Managers</span><span>District Managers</span><span>Division Managers</span><span>Directors of Operations</span><span>VPs of Operations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <div className="proof">
        <div className="container">
          <div className="proof-title">Proven Performance Since February 2025</div>
          <div className="proof-stats fade-up">
            <div><div className="proof-stat-num">13+</div><div className="proof-stat-text">Placements since launch</div></div>
            <div><div className="proof-stat-num">10+</div><div className="proof-stat-text">Client companies served</div></div>
            <div><div className="proof-stat-num">6</div><div className="proof-stat-text">US &amp; Canadian regions covered</div></div>
          </div>
        </div>
      </div>

      {/* TRACK RECORD */}
      <section className="track-record" id="placements">
        <div className="container">
          <div className="fade-up">
            <div className="section-label">Recent Placements</div>
            <h2 className="section-title">Results speak louder than resumes.</h2>
            <p className="section-subtitle">A snapshot of talent placed since launching Real Deal Talent in 2025.</p>
          </div>
          <div className="placements-grid">
            {[
              { role: "Director of Strategic Accounts", loc: "O&G Field Services — US & Canada", tag: "Sales" },
              { role: "Regional Sales Manager", loc: "Gulf Coast", tag: "Sales" },
              { role: "Regional Sales Manager", loc: "Alberta, Canada", tag: "Sales" },
              { role: "Regional Sales Manager", loc: "British Columbia, Canada", tag: "Sales" },
              { role: "General Manager, Field Services", loc: "Ohio", tag: "Operations" },
              { role: "General Manager, Field Services", loc: "Tennessee", tag: "Operations" },
              { role: "General Manager, Lab Services", loc: "Ohio", tag: "Operations" },
              { role: "Territory Sales Manager", loc: "South Carolina", tag: "Sales" },
              { role: "Territory Sales Manager", loc: "Texas", tag: "Sales" },
              { role: "Sales Executive", loc: "Texas", tag: "Sales" },
              { role: "Sales Executive", loc: "Western Canada", tag: "Sales" },
              { role: "Outside Sales Rep", loc: "Central Texas", tag: "Sales" },
              { role: "Account Manager", loc: "West Texas", tag: "Sales" },
            ].map((p, i) => (
              <div className="placement-item fade-up" key={i}>
                <div className="placement-role">{p.role}</div>
                <div className="placement-loc">{p.loc}</div>
                <div className="placement-tag">{p.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT TYPES */}
      <section className="clients-section">
        <div className="container">
          <div className="fade-up">
            <div className="section-label" style={{ justifyContent: "center" }}>Who We Work With</div>
            <h2 className="section-title" style={{ textAlign: "center" }}>Built for companies that build things.</h2>
          </div>
          <div className="client-types fade-up">
            <div className="client-type">
              <div className="client-type-icon"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <h3>PE-Backed Companies</h3>
              <p>Portfolio companies needing to scale sales and ops teams on a timeline</p>
            </div>
            <div className="client-type">
              <div className="client-type-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3zM12 8v8M8 12h8"/></svg></div>
              <h3>Publicly-Traded Firms</h3>
              <p>Large-cap industrials and services companies expanding market coverage</p>
            </div>
            <div className="client-type">
              <div className="client-type-icon"><svg viewBox="0 0 24 24"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <h3>Privately-Held Operators</h3>
              <p>Family-owned and founder-led industrial businesses ready to grow</p>
            </div>
            <div className="client-type">
              <div className="client-type-icon"><svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
              <h3>VC-Backed Startups</h3>
              <p>IIoT, SaaS, and industrial tech companies hiring their first sales leaders</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner" id="contact">
        <div className="container">
          <h2 className="fade-up">Ready to make your next great hire?</h2>
          <p className="fade-up">Whether you need one critical placement or want to build an entire team, let&apos;s have a conversation about how Real Deal Talent can help.</p>
          <a href="https://www.linkedin.com/in/iwalji/" target="_blank" rel="noopener noreferrer" className="btn-white fade-up">
            Connect on LinkedIn
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12l8-8M6 4h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO_SRC} alt="Real Deal Talent" className="footer-logo-img" />
              </div>
              <p className="footer-desc">Placing Sales &amp; Operations talent with Industrial Services, Heavy Equipment, Manufacturing &amp; Distribution companies across the US &amp; Canada.</p>
            </div>
            <div className="footer-col">
              <h4>Navigate</h4>
              <a href="#about">About</a><a href="#industries">Industries</a><a href="#specialties">Specialties</a><a href="#placements">Track Record</a>
            </div>
            <div className="footer-col">
              <h4>Industries</h4>
              <a href="#industries">SIPA Contractors</a><a href="#industries">TICC Contractors</a><a href="#industries">Heavy Equipment</a><a href="#industries">Master Distribution</a>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <a href="https://www.linkedin.com/in/iwalji/" target="_blank" rel="noopener noreferrer">LinkedIn Profile</a>
              <a href="https://www.linkedin.com/company/realdealtalent/" target="_blank" rel="noopener noreferrer">Company Page</a>
              <a href="mailto:info@realdealtalent.com">Email Us</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Real Deal Talent LLC. Austin, Texas. All rights reserved.</p>
            <div className="footer-social">
              <a href="https://www.linkedin.com/in/iwalji/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
